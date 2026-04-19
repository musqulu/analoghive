"use client"

import { useAuthSession } from "@/components/auth-session-provider"

/**
 * @deprecated Use {@link useAuthSession} from `@/components/auth-session-provider` instead.
 */
export function useSupabaseUser() {
  return useAuthSession()
}
