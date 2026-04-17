import type { Metadata } from "next"
import Link from "next/link"
import { signup } from "@/app/auth/actions"
import { Button } from "@/components/landing/button"
import { Container } from "@/components/landing/container"

export const metadata: Metadata = {
  title: "Create account — Analog Hive",
  description: "Create an Analog Hive account to save development times and notes.",
}

type SearchParams = Promise<{ error?: string }>

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-background py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-lg bg-card p-8 shadow-ds-card">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
              Create account
            </h1>
            <p className="text-base/7 text-muted-foreground">
              Sign up with email. You can add saved times and notes here later.
            </p>
          </div>

          {params.error ? (
            <p className="mb-6 text-sm text-destructive" role="alert">
              {params.error}
            </p>
          ) : null}

          <form action={signup} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-email" className="text-sm/7 font-medium text-foreground">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="ds-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-password" className="text-sm/7 font-medium text-foreground">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="ds-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-confirm" className="text-sm/7 font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="signup-confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="ds-input"
              />
            </div>
            <Button type="submit" color="dark/light" className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm/7 text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-link underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    </main>
  )
}
