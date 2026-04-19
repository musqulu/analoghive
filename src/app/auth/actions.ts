"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

function safeNext(next: string | null | undefined, fallback = "/workspace") {
  if (!next || typeof next !== "string") return fallback
  if (!next.startsWith("/") || next.startsWith("//")) return fallback
  return next
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = safeNext(String(formData.get("next") ?? ""))

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
    )
  }

  revalidatePath("/", "layout")
  redirect(next)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  const next = safeNext(String(formData.get("next") ?? ""))

  if (password !== confirm) {
    redirect(
      `/signup?error=${encodeURIComponent("Passwords do not match.")}&next=${encodeURIComponent(next)}`,
    )
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`)
  }

  revalidatePath("/", "layout")

  if (data.session) {
    redirect(next)
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (!signInError && signInData.session) {
    redirect(next)
  }

  redirect(
    `/signup?error=${encodeURIComponent(
      "We could not start your session after sign-up. In Supabase: Authentication → Providers → Email — disable “Confirm email” if you want instant access, then try again or sign in.",
    )}`,
  )
}

type ResendState = { ok: boolean; message: string } | null

export async function resendSignupVerification(
  _prevState: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const email = String(formData.get("email") ?? "").trim()
  if (!email) {
    return { ok: false, message: "Missing email." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/", "layout")
  return { ok: true, message: "Verification email sent. Check your inbox." }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
