import type { CompactDeveloperRow, UserChatContext } from "@/lib/ai/context-loader"

export const ASSISTANT_PERSONA_MARKER = "[analoghive-darkroom-assistant-v1]"

const PERSONA = `${ASSISTANT_PERSONA_MARKER}
You are the Analog Hive Darkroom Assistant: a patient, encouraging mentor for analog film photographers.

Scope: black & white and color film photography, film development chemistry (developers, stop, fix, wash), darkroom workflow, push/pull processing, agitation patterns, temperature correction, dilutions, mixing volumes, equipment basics (tanks, reels, thermometers), troubleshooting (over/underdevelopment, streaks, base fog, drying marks), and printing fundamentals when asked.

Tone: helpful, instructive, and confidence-building. Explain the *why* behind each step so the photographer learns. Prefer short paragraphs, plain language, and concrete numbers (time, temperature, dilution).

Boundaries: if a question is clearly outside analog photography or darkroom work, politely redirect once and suggest a related photography question they could ask instead. Never invent facts, brand recommendations, or chemical safety claims you are not sure about; when uncertain, say so.

Format: plain text only. No markdown headings, no code fences, no tables.`

const TIME_GUIDANCE = `When the user asks about a specific film + developer + time combination:
1. First check the <developer-data> block below. If a matching dilution and temperature row is present, use those times verbatim and cite the source as "the Analog Hive chart".
2. If the combo is NOT in <developer-data>, say plainly: "I don't have authoritative data for that exact combination in the chart." Then offer general guidance (typical dilution ranges for that developer, agitation, temperature) without inventing a specific minute count.
3. If the user has a saved recipe in <user-recipes> that matches, prefer their saved time and mention it is *their* recipe.
4. Always state temperature and dilution alongside any time you give. A bare "8 minutes" is never useful by itself.`

function formatRecipes(ctx: UserChatContext): string {
  if (ctx.recipes.length === 0) return "(no saved recipes yet)"
  return ctx.recipes
    .map((r) => {
      const id = r.identity
      const parts = [
        `- "${r.title}"`,
        `${id.filmName || "?"} @ ISO ${id.filmIso || "?"} (${id.filmFormat})`,
        `${id.developerName || "?"}${r.developerDilution ? ` ${r.developerDilution}` : ""}`,
        `${r.developmentTimeMinutes} min @ ${r.modifiedTemperature}°${r.temperatureUnit === "celsius" ? "C" : "F"}`,
      ]
      if (id.pushPullStops !== 0) parts.push(`push/pull ${id.pushPullStops > 0 ? "+" : ""}${id.pushPullStops}`)
      if (r.isColor) parts.push("color")
      return parts.join(" | ")
    })
    .join("\n")
}

function formatFavorites(ctx: UserChatContext): string {
  if (ctx.favorites.length === 0) return "(no favorites yet)"
  return ctx.favorites
    .map((f) => {
      const label = f.displayName ? `"${f.displayName}" — ` : ""
      const stops = f.pushPullStops !== 0 ? ` push/pull ${f.pushPullStops > 0 ? "+" : ""}${f.pushPullStops}` : ""
      return `- ${label}${f.filmName} @ ISO ${f.filmIso} (${f.filmFormat}) | ${f.developerName} ${f.optionKey} | ${f.correctedTimeMinutes} min @ ${f.modifiedTemperature}°${f.temperatureUnit === "celsius" ? "C" : "F"}${stops}`
    })
    .join("\n")
}

function formatLogs(ctx: UserChatContext): string {
  if (ctx.recentLogs.length === 0) return "(no development logs yet)"
  return ctx.recentLogs
    .map((l) => {
      const when = l.createdAt.slice(0, 10)
      return `- ${when}: ${l.filmName} @ ISO ${l.filmIso} | ${l.developerName} ${l.optionKey}`
    })
    .join("\n")
}

function formatDevelopers(rows: CompactDeveloperRow[]): string {
  if (rows.length === 0) return "(no chart rows matched the current message)"
  return rows
    .map((row) => {
      const dilutionLines = row.dilutions
        .map((d) => {
          const times = Object.entries(d.timesByIso)
            .map(([iso, minutes]) => `ISO ${iso}: ${minutes} min`)
            .join(", ")
          return `  ${d.label} @ ${d.temperatureC}°C — ${times}`
        })
        .join("\n")
      return `${row.name} (${row.manufacturer}, ${row.type})\n${dilutionLines}`
    })
    .join("\n\n")
}

export function buildSystemPrompt(args: {
  context: UserChatContext
  developerRows: CompactDeveloperRow[]
}): string {
  const { context, developerRows } = args
  return [
    PERSONA,
    "",
    TIME_GUIDANCE,
    "",
    "<user-recipes>",
    formatRecipes(context),
    "</user-recipes>",
    "",
    "<user-favorites>",
    formatFavorites(context),
    "</user-favorites>",
    "",
    "<user-recent-logs>",
    formatLogs(context),
    "</user-recent-logs>",
    "",
    "<developer-data>",
    formatDevelopers(developerRows),
    "</developer-data>",
  ].join("\n")
}
