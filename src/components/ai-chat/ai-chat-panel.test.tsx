import { render, screen } from "@testing-library/react"
import { AiChatPanel } from "./ai-chat-panel"
import { type UseAiChatResult, useAiChat } from "./use-ai-chat"

jest.mock("./use-ai-chat")

const mockUseAiChat = useAiChat as jest.MockedFunction<typeof useAiChat>

function stubChat(patch: Partial<UseAiChatResult>): UseAiChatResult {
  return {
    view: "list",
    conversations: [],
    activeConversationId: null,
    activeTitle: "",
    messages: [],
    steps: [],
    streaming: false,
    error: null,
    goToList: jest.fn(),
    openThread: jest.fn(),
    newConversation: jest.fn(),
    deleteConversation: jest.fn(),
    send: jest.fn(),
    refreshList: jest.fn(),
    ...patch,
  }
}

describe("<AiChatPanel />", () => {
  beforeEach(() => {
    mockUseAiChat.mockReset()
  })

  it("renders inbox list header and no legacy Clear affordance", () => {
    mockUseAiChat.mockReturnValue(
      stubChat({
        conversations: [
          {
            id: "c1",
            title: "HC-110",
            lastMessagePreview: "notes",
            updatedAt: "2026-05-04T10:11:12.000Z",
          },
        ],
      }),
    )

    render(<AiChatPanel />)
    expect(screen.getByText("Chats")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /new conversation/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^new chat$/i })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /delete conversation/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^clear$/i })).not.toBeInTheDocument()
  })

  it("shows back navigation in thread mode", () => {
    mockUseAiChat.mockReturnValue(
      stubChat({
        view: "thread",
        activeConversationId: "c1",
        activeTitle: "Rodinal basics",
      }),
    )

    render(<AiChatPanel />)
    expect(screen.getByRole("button", { name: /back to chat list/i })).toBeInTheDocument()
  })
})
