// Add React Testing Library's custom jest matchers
require("@testing-library/jest-dom")

// jsdom does not implement scrollTo (used by darkroom mode cleanup)
if (typeof window !== "undefined") {
  window.scrollTo = jest.fn()
}