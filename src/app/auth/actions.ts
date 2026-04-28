"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { serverSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

function safeNext(next: string | null | undefined, fallback = "/workspace") {
  if (!next || typeof next !== "string") return fallback
  if (!next.startsWith("/") || next.startsWith("//")) return fallback
  return next
}

function authRateLimitUserMessage(raw: string, status?: number) {
  if (status === 429) {
    return "Too many confirmation emails were requested. Wait at least a minute before trying again, or longer if you have been testing sign-up often (Supabase limits how many emails can be sent per hour)."
  }
  const lower = raw.toLowerCase()
  if (lower.includes("rate limit")) {
    return "Too many confirmation emails were requested. Please wait several minutes and try again."
  }
  return raw
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
  const next = safeNext(String(formData.get("next") ?? ""))

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${serverSiteUrl()}/auth/callback`,
    },
  })

  if (error) {
    redirect(
      `/signup?error=${encodeURIComponent(authRateLimitUserMessage(error.message, error.status))}&next=${encodeURIComponent(next)}`,
    )
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
    )}&next=${encodeURIComponent(next)}`,
  )
}

type ResendState = { ok: boolean; message: string } | null

export async function resendSignupVerification(
  _prevState: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const email = String(formData.get("email") ?? "").trim()
  const next = safeNext(String(formData.get("next") ?? ""))
  if (!email) {
    return { ok: false, message: "Missing email." }
  }

  const callbackWithNext = `${serverSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: callbackWithNext,
    },
  })

  if (error) {
    return {
      ok: false,
      message: authRateLimitUserMessage(error.message, error.status),
    }
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
