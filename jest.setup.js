// Add React Testing Library's custom jest matchers
require("@testing-library/jest-dom")

// jsdom does not implement scrollTo (used by darkroom mode cleanup)
window.scrollTo = jest.fn()