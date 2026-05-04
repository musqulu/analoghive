import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AiChatFab } from "@/components/ai-chat/ai-chat-fab"
import { AuthSessionProvider } from "@/components/auth-session-provider"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { Nav } from "@/components/nav"
import { createClient } from "@/lib/supabase/server"
import "./globals.css"

export const metadata: Metadata = {
  title: "Analog Hive",
  description:
    "Calculate film development times, developer dilutions, temperature correction, and mixing volumes for black & white and color film.",
}

function parseGraceDays() {
  const raw = process.env.NEXT_PUBLIC_EMAIL_VERIFY_GRACE_DAYS
  const n = parseInt(raw ?? "3", 10)
  if (Number.isFinite(n) && n >= 1) return n
  return 3
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const unverifiedEmail =
    user?.email && !user.email_confirmed_at ? user.email : null
  const graceDays = parseGraceDays()

  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <AuthSessionProvider authenticatedOnServer={Boolean(user)}>
          <Nav />
          {unverifiedEmail ? (
            <EmailVerificationBanner email={unverifiedEmail} graceDays={graceDays} />
          ) : null}
          {children}
          <AiChatFab />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
