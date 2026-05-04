// Add React Testing Library's custom jest matchers
require("@testing-library/jest-dom")

// Some JSDOM environments omit Web APIs relied on by shared streaming helpers.
const { TextDecoder, TextEncoder } = require("util")
globalThis.TextEncoder ??= TextEncoder
globalThis.TextDecoder ??= TextDecoder

// jsdom does not implement scrollTo (used by darkroom mode cleanup)
if (typeof window !== "undefined") {
  window.scrollTo = jest.fn()
}