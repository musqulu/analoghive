import {
  NEW_CHAT_TITLE,
  appendMessage,
  countMessages,
  createConversation,
  deleteConversation,
  getConversation,
  getMessages,
  getMessagesAfterCount,
  getRecentMessagesForPrompt,
  listConversations,
  updateConversationMeta,
} from "@/lib/ai/conversation-store"

interface QueryShape {
  table: string
  op: "select" | "insert" | "update" | "delete"
  filters: Array<{ kind: string; column: string; value: unknown }>
  order?: { column: string; ascending: boolean }
  limit?: number
  selectCols?: string
  insertRow?: Record<string, unknown>
  updatePatch?: Record<string, unknown>
}

function makeSupabase(responder: (q: QueryShape) => unknown) {
  const buildSelectChain = (query: QueryShape) => {
    const chain = {
      eq(column: string, value: unknown) {
        query.filters.push({ kind: "eq", column, value })
        return chain
      },
      order(column: string, opts?: { ascending?: boolean }) {
        query.order = { column, ascending: Boolean(opts?.ascending) }
        return chain
      },
      limit(n: number) {
        query.limit = n
        return chain
      },
      maybeSingle() {
        return Promise.resolve(responder(query))
      },
      single() {
        return Promise.resolve(responder(query))
      },
      then(onFulfilled: (v: unknown) => unknown) {
        return Promise.resolve(responder(query)).then(onFulfilled)
      },
    }
    return chain
  }

  return {
    from(table: string) {
      const query: QueryShape = { table, op: "select", filters: [] }
      return {
        select(cols: string, opts?: { count?: string; head?: boolean }) {
          query.selectCols = cols
          if (opts?.head) {
            return {
              eq(column: string, value: unknown) {
                query.filters.push({ kind: "eq", column, value })
                return {
                  eq(column2: string, value2: unknown) {
                    query.filters.push({ kind: "eq", column: column2, value: value2 })
                    return {
                      then(onFulfilled: (v: unknown) => unknown) {
                        query.op = "select"
                        return Promise.resolve(responder(query)).then(onFulfilled)
                      },
                    }
                  },
                  then(onFulfilled: (v: unknown) => unknown) {
                    return Promise.resolve(responder(query)).then(onFulfilled)
                  },
                }
              },
            }
          }
          return buildSelectChain(query)
        },
        insert(row: Record<string, unknown>) {
          query.op = "insert"
          query.insertRow = row
          return {
            select() {
              return {
                single() {
                  return Promise.resolve(responder(query))
                },
              }
            },
          }
        },
        update(patch: Record<string, unknown>) {
          query.op = "update"
          query.updatePatch = patch
          return {
            eq(column: string, value: unknown) {
              query.filters.push({ kind: "eq", column, value })
              return {
                eq(column2: string, value2: unknown) {
                  query.filters.push({ kind: "eq", column: column2, value: value2 })
                  return {
                    then(onFulfilled: (v: unknown) => unknown) {
                      return Promise.resolve(responder(query)).then(onFulfilled)
                    },
                  }
                },
                then(onFulfilled: (v: unknown) => unknown) {
                  return Promise.resolve(responder(query)).then(onFulfilled)
                },
              }
            },
          }
        },
        delete() {
          query.op = "delete"
          return {
            eq(column: string, value: unknown) {
              query.filters.push({ kind: "eq", column, value })
              return {
                eq(column2: string, value2: unknown) {
                  query.filters.push({ kind: "eq", column: column2, value: value2 })
                  return {
                    select() {
                      return {
                        then(onFulfilled: (v: unknown) => unknown) {
                          return Promise.resolve(responder(query)).then(onFulfilled)
                        },
                      }
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  } as Parameters<typeof listConversations>[0]
}

describe("conversation-store", () => {
  it("lists conversations ordered by updated_at desc", async () => {
    const supabase = makeSupabase((q) => {
      if (q.table === "chat_conversations" && q.filters.some((f) => f.column === "user_id")) {
        expect(q.order).toEqual({ column: "updated_at", ascending: false })
        return {
          data: [
            {
              id: "c1",
              title: "A",
              last_message_preview: "hi",
              updated_at: "2026-05-04T12:00:00Z",
            },
          ],
        }
      }
      return { data: [] }
    })

    const list = await listConversations(supabase, "u1")
    expect(list).toEqual([
      {
        id: "c1",
        title: "A",
        lastMessagePreview: "hi",
        updatedAt: "2026-05-04T12:00:00Z",
      },
    ])
  })

  it("createConversation inserts New chat placeholder", async () => {
    const supabase = makeSupabase((q) => {
      if (q.op === "insert" && q.table === "chat_conversations") {
        expect(q.insertRow).toMatchObject({ user_id: "u1", title: NEW_CHAT_TITLE })
        return { data: { id: "new-id", title: NEW_CHAT_TITLE } }
      }
      return { data: null }
    })

    const created = await createConversation(supabase, "u1")
    expect(created).toEqual({ id: "new-id", title: NEW_CHAT_TITLE })
  })

  it("getRecentMessagesForPrompt reverses desc query to chronological", async () => {
    const supabase = makeSupabase((q) => {
      if (q.limit === 2 && q.order?.ascending === false) {
        return {
          data: [
            { role: "assistant", content: "b" },
            { role: "user", content: "a" },
          ],
        }
      }
      return { data: [] }
    })

    const recent = await getRecentMessagesForPrompt(supabase, "u1", "cid", 2)
    expect(recent).toEqual([
      { role: "user", content: "a" },
      { role: "assistant", content: "b" },
    ])
  })

  it("appendMessage inserts with conversation + user ids", async () => {
    const supabase = makeSupabase((q) => {
      if (q.op === "insert" && q.table === "chat_messages") {
        expect(q.insertRow).toMatchObject({
          conversation_id: "cid",
          user_id: "u1",
          role: "user",
          content: "hello",
        })
        return { data: { id: "mid" } }
      }
      return { data: null }
    })

    await expect(appendMessage(supabase, "u1", "cid", "user", "hello")).resolves.toEqual({
      id: "mid",
    })
  })

  it("deleteConversation returns false when nothing deleted", async () => {
    const supabase = makeSupabase((q) => {
      if (q.op === "delete") return { data: [] }
      return { data: [] }
    })

    await expect(deleteConversation(supabase, "u1", "cid")).resolves.toBe(false)
  })

  it("deleteConversation returns true when a row deleted", async () => {
    const supabase = makeSupabase((q) => {
      if (q.op === "delete") return { data: [{ id: "cid" }] }
      return { data: [] }
    })

    await expect(deleteConversation(supabase, "u1", "cid")).resolves.toBe(true)
  })

  it("countMessages uses head exact count", async () => {
    const supabase = makeSupabase((q) => {
      if ((q.selectCols as string)?.includes("id") && q.table === "chat_messages") {
        return { count: 7 }
      }
      return { count: 0 }
    })

    await expect(countMessages(supabase, "u1", "cid")).resolves.toBe(7)
  })

  it("getMessagesAfterCount skips first N rows", async () => {
    const supabase = makeSupabase(() => ({
      data: [
        { role: "user", content: "1" },
        { role: "assistant", content: "2" },
        { role: "user", content: "3" },
      ],
    }))

    const slice = await getMessagesAfterCount(supabase, "u1", "cid", 2)
    expect(slice).toEqual([{ role: "user", content: "3" }])
  })

  it("getConversation returns null when missing", async () => {
    const supabase = makeSupabase(() => ({ data: null }))
    await expect(getConversation(supabase, "u1", "x")).resolves.toBeNull()
  })

  it("updateConversationMeta sends patch + updated_at", async () => {
    const captured: QueryShape[] = []
    const supabase = makeSupabase((q) => {
      captured.push(q)
      return {}
    })

    await updateConversationMeta(supabase, "u1", "cid", {
      title: "T",
      last_message_preview: "p",
    })

    expect(captured[0]?.op).toBe("update")
    expect(captured[0]?.updatePatch).toMatchObject({
      title: "T",
      last_message_preview: "p",
    })
    expect(captured[0]?.updatePatch?.updated_at).toBeDefined()
  })

  it("getMessages returns chronological rows", async () => {
    const supabase = makeSupabase(() => ({
      data: [{ id: "m1", role: "user", content: "a", created_at: "2026-01-01Z" }],
    }))

    const rows = await getMessages(supabase, "u1", "cid")
    expect(rows[0]).toMatchObject({ id: "m1", role: "user", content: "a" })
  })
})
