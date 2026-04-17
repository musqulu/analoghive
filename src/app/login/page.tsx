import type { Metadata } from "next"
import Link from "next/link"
import { login } from "@/app/auth/actions"
import { Button } from "@/components/landing/button"
import { Container } from "@/components/landing/container"

export const metadata: Metadata = {
  title: "Sign in — Analog Hive",
  description: "Sign in to Analog Hive to save development times and notes.",
}

type SearchParams = Promise<{
  error?: string
  message?: string
  next?: string
}>

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/workspace"

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-background py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-lg bg-card p-8 shadow-ds-card">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
              Sign in
            </h1>
            <p className="text-base/7 text-muted-foreground">
              Use the email and password for your Analog Hive account.
            </p>
          </div>

          {params.error ? (
            <p className="mb-6 text-sm text-destructive" role="alert">
              {params.error}
            </p>
          ) : null}
          {params.message ? (
            <p className="mb-6 text-sm text-muted-foreground" role="status">
              {params.message}
            </p>
          ) : null}

          <form action={login} className="flex flex-col gap-6">
            <input type="hidden" name="next" value={next} />
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="text-sm/7 font-medium text-foreground">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="ds-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-sm/7 font-medium text-foreground">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="ds-input"
              />
            </div>
            <Button type="submit" color="dark/light" className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm/7 text-muted-foreground">
            No account?{" "}
            <Link
              href="/signup"
              className="font-medium text-link underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </Container>
    </main>
  )
}
