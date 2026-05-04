import { render, screen, fireEvent } from "@testing-library/react"
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "./chain-of-thought"

describe("ChainOfThought", () => {
  it("renders grouped steps inside the collapsible shell", () => {
    render(
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader>Working</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep label="Loaded data" description="done" status="complete" />
        </ChainOfThoughtContent>
      </ChainOfThought>,
    )

    expect(screen.getByText("Working")).toBeInTheDocument()
    expect(screen.getByText("Loaded data")).toBeInTheDocument()

    const trigger = screen.getByRole("button", { name: /working/i })
    fireEvent.click(trigger)
    // Collapsing hides the labeled step region (radix closed state hides content wrapper)
    expect(screen.queryByText("Loaded data")).not.toBeInTheDocument()
  })
})
