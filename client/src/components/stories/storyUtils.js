// Shared utilities for story card components

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num?.toLocaleString() || '0'
}

export const normalizeName = (name) => {
  if (!name) return 'Unknown'
  return name.replace(/\s+/g, ' ').trim()
}

// Replace regular spaces with en-spaces so html2canvas doesn't collapse them
export const displayName = (name) => normalizeName(name).replace(/ /g, '\u2002')

export const wrapToLines = (text, maxChars) => {
  if (!text) return ['Unknown']
  const words = text.split(' ')
  const lines = []
  let current = ''

  words.forEach((word) => {
    let remaining = word
    while (remaining.length > maxChars) {
      if (current) {
        lines.push(current)
        current = ''
      }
      lines.push(remaining.slice(0, maxChars))
      remaining = remaining.slice(maxChars)
    }

    if (!current) {
      current = remaining
    } else if ((current.length + 1 + remaining.length) <= maxChars) {
      current = `${current} ${remaining}`
    } else {
      lines.push(current)
      current = remaining
    }
  })

  if (current) lines.push(current)
  return lines
}

export const fitNameToLines = (rawName, { maxWidth, baseSize, minSize, maxLines }) => {
  const name = normalizeName(rawName)
  let fontSize = baseSize
  let lines = [name]

  while (fontSize >= minSize) {
    const charsPerLine = Math.max(8, Math.floor(maxWidth / (fontSize * 0.56)))
    lines = wrapToLines(name, charsPerLine)
    if (lines.length <= maxLines) break
    fontSize -= 1
  }

  const lineHeight = fontSize < 18 ? 1.15 : 1.25
  return {
    text: lines.map(line => displayName(line)).join('\n'),
    fontSize,
    lineHeight,
  }
}
