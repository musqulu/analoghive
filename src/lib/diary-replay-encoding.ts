/**
 * Encode/decode `DevelopmentProcessSnapshot` for diary "Run again" URLs (base64url JSON).
 */

import type { DevelopmentProcessSnapshot } from "@/types/development-log"

function utf8BytesToBinaryString(bytes: Uint8Array): string {
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i])
  }
  return out
}

/** Browser + Node-compatible base64url of UTF-8 JSON. */
export function encodeSnapshotForReplayUrl(snapshot: DevelopmentProcessSnapshot): string {
  const json = JSON.stringify(snapshot)
  const bytes = new TextEncoder().encode(json)
  let b64 = btoa(utf8BytesToBinaryString(bytes))
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "")
}

function base64UrlToBase64(s: string): string {
  let b64 = s.replace(/-/gu, "+").replace(/_/gu, "/")
  const pad = b64.length % 4 === 2 ? "==" : b64.length % 4 === 3 ? "=" : ""
  return b64 + pad
}

export function parseReplayParam(encoded: string | null): unknown {
  if (!encoded?.trim()) return null
  try {
    const b64 = base64UrlToBase64(encoded.trim())
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json) as unknown
  } catch {
    return null
  }
}
