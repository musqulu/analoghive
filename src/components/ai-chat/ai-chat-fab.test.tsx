import { render, screen, fireEvent, waitFor } from "@testing-library/react"

const mockUseAuthSession = jest.fn<{ showAuthed: boolean }, []>()

jest.mock("@/components/auth-session-provider", () => ({
  useAuthSession: () => mockUseAuthSession(),
}))

jest.mock("@/components/ai-chat/ai-chat-panel", () => ({
  AiChatPanel: () => <div data-testid="ai-chat-panel">panel</div>,
}))

jest.mock("lucide-react", () => ({
  __esModule: true,
  MessageCircle: () => <span data-testid="message-circle-icon" />,
  X: () => <span data-testid="x-icon" />,
}))

import { AiChatFab } from "./ai-chat-fab"

describe("<AiChatFab />", () => {
  beforeEach(() => {
    mockUseAuthSession.mockReset()
  })

  it("renders nothing when the user is not signed in", () => {
    mockUseAuthSession.mockReturnValue({ showAuthed: false })
    const { container } = render(<AiChatFab />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole("button", { name: /open darkroom assistant/i })).not.toBeInTheDocument()
  })

  it("renders the FAB and opens the panel when clicked (signed in)", async () => {
    mockUseAuthSession.mockReturnValue({ showAuthed: true })
    render(<AiChatFab />)

    const fab = screen.getByRole("button", { name: /open darkroom assistant/i })
    expect(fab).toBeInTheDocument()
    expect(screen.queryByTestId("ai-chat-panel")).not.toBeInTheDocument()

    fireEvent.click(fab)

    await waitFor(() => {
      expect(screen.getByTestId("ai-chat-panel")).toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: /close darkroom assistant/i })).toBeInTheDocument()
  })

  it("closes the panel when the close button is clicked", async () => {
    mockUseAuthSession.mockReturnValue({ showAuthed: true })
    render(<AiChatFab />)

    fireEvent.click(screen.getByRole("button", { name: /open darkroom assistant/i }))
    await waitFor(() => expect(screen.getByTestId("ai-chat-panel")).toBeInTheDocument())

    fireEvent.click(screen.getByRole("button", { name: /close darkroom assistant/i }))
    await waitFor(() =>
      expect(screen.queryByTestId("ai-chat-panel")).not.toBeInTheDocument(),
    )
  })
})
