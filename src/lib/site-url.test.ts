import { requestOrigin, serverSiteUrl } from "@/lib/site-url"

const originalEnv = process.env

describe("site-url helpers", () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.VERCEL_URL
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe("serverSiteUrl", () => {
    it("uses Vercel URL when configured site URL is local", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
      process.env.VERCEL_URL = "analog-hive.vercel.app"

      expect(serverSiteUrl()).toBe("https://analog-hive.vercel.app")
    })
  })

  describe("requestOrigin", () => {
    it("uses a forwarded origin that matches the canonical site", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://analog-hive.example"
      const request = new Request("http://internal.local/auth/callback", {
        headers: {
          "x-forwarded-host": "analog-hive.example",
          "x-forwarded-proto": "https",
        },
      })

      expect(requestOrigin(request)).toBe("https://analog-hive.example")
    })

    it("ignores untrusted forwarded hosts", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://analog-hive.example"
      const request = new Request("https://analog-hive.example/auth/callback", {
        headers: {
          "x-forwarded-host": "evil.example",
          "x-forwarded-proto": "https",
        },
      })

      expect(requestOrigin(request)).toBe("https://analog-hive.example")
    })

    it("ignores forwarded origins with invalid protocols", () => {
      const request = new Request("https://analog-hive.example/auth/callback", {
        headers: {
          "x-forwarded-host": "analog-hive.example",
          "x-forwarded-proto": "javascript",
        },
      })

      expect(requestOrigin(request)).toBe("https://analog-hive.example")
    })
  })
})
