// Derived at build time from VITE_SUPABASE_URL so the project URL is never
// hardcoded in the repo. Falls back to an empty string when unset.
const supabaseStorageBase = (() => {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url) return ''
  return `${url.replace(/\/+$/, '')}/storage/v1/object/public`
})()

export const PLACEHOLDER_IMAGE_URL = supabaseStorageBase
  ? `${supabaseStorageBase}/pierniczki/placeholder.png`
  : ''
