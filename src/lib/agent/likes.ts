export function parseLikes(text: string): string[] {
  const quoted: string[] = []
  const withoutQuotes = text.replace(/"([^"]+)"|“([^”]+)”/g, (_match, a: string, b: string) => {
    const value = (a ?? b ?? "").trim()
    if (value) quoted.push(value)
    return " "
  })

  const pieces = withoutQuotes
    .split(/[,，、;\n|]|\s+&\s+|\s+and\s+/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && part.length <= 80)

  const seen = new Set<string>()
  const likes: string[] = []
  for (const like of [...quoted, ...pieces]) {
    const key = like.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    likes.push(like)
    if (likes.length >= 8) break
  }
  return likes
}
