"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/landing/button"

export function SignupSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" color="dark/light" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  )
}
