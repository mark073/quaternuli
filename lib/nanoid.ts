const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function nanoid(length = 12): string {
  let result = ''
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  for (const b of bytes) result += CHARS[b % CHARS.length]
  return result
}
