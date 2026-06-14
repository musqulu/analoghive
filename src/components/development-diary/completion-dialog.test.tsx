import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { DiaryCompletionDialog } from "./completion-dialog"
import { updateDiaryEntry } from "@/lib/update-diary-entry"

jest.mock("@/components/development-diary/confetti", () => ({
  burstCelebrationConfetti: jest.fn(),
}))

jest.mock("@/lib/update-diary-entry", () => ({
  updateDiaryEntry: jest.fn(),
}))

const mockUpdateDiaryEntry = updateDiaryEntry as jest.MockedFunction<
  typeof updateDiaryEntry
>

describe("DiaryCompletionDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("keeps entered notes visible when saving fails", async () => {
    mockUpdateDiaryEntry.mockResolvedValue(false)
    const onOpenChange = jest.fn()

    render(
      <DiaryCompletionDialog
        open
        onOpenChange={onOpenChange}
        logEntryId="log-1"
        summary={null}
      />,
    )

    fireEvent.change(screen.getByLabelText("Diary title (optional)"), {
      target: { value: "Night roll" },
    })
    fireEvent.change(screen.getByLabelText("Diary notes (optional)"), {
      target: { value: "Dense but printable" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() =>
      expect(mockUpdateDiaryEntry).toHaveBeenCalledWith({
        id: "log-1",
        title: "Night roll",
        notes: "Dense but printable",
      }),
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couldn't save your diary notes",
    )
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByLabelText("Diary title (optional)")).toHaveValue("Night roll")
    expect(screen.getByLabelText("Diary notes (optional)")).toHaveValue(
      "Dense but printable",
    )
  })

  it("closes after diary notes are saved", async () => {
    mockUpdateDiaryEntry.mockResolvedValue(true)
    const onOpenChange = jest.fn()

    render(
      <DiaryCompletionDialog
        open
        onOpenChange={onOpenChange}
        logEntryId="log-1"
        summary={null}
      />,
    )

    fireEvent.change(screen.getByLabelText("Diary title (optional)"), {
      target: { value: "Night roll" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it("clears entered notes when a new completion arrives while the dialog stays open", () => {
    const { rerender } = render(
      <DiaryCompletionDialog
        open
        onOpenChange={jest.fn()}
        logEntryId="log-1"
        completionKey="session:1"
        summary={null}
      />,
    )

    fireEvent.change(screen.getByLabelText("Diary title (optional)"), {
      target: { value: "Roll A" },
    })
    fireEvent.change(screen.getByLabelText("Diary notes (optional)"), {
      target: { value: "Notes for roll A" },
    })

    rerender(
      <DiaryCompletionDialog
        open
        onOpenChange={jest.fn()}
        logEntryId="log-2"
        completionKey="session:2"
        summary={null}
      />,
    )

    expect(screen.getByLabelText("Diary title (optional)")).toHaveValue("")
    expect(screen.getByLabelText("Diary notes (optional)")).toHaveValue("")
  })
})
