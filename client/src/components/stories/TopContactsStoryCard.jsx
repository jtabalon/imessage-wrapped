import StoryCard from './StoryCard'

const podiumColors = [
  ['#6366f1', '#8b5cf6'],  // #1 — vibrant indigo-purple
  ['#c9a0c8', '#c5848e'],  // #2 — muted pink
  ['#7aaec0', '#72bec2'],  // #3 — muted teal
]

function TopContactsStoryCard({ contacts }) {
  if (!contacts || contacts.length === 0) return null

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  // Replace regular spaces with en-spaces so html2canvas doesn't collapse them
  const normalizeName = (name) => {
    if (!name) return 'Unknown'
    return name.replace(/\s+/g, ' ').trim()
  }

  // Format phone numbers for readability: +18587761020 → +1 858 776 1020
  const formatPhone = (str) => {
    if (!str) return str
    const match = str.match(/^\+?1?(\d{3})(\d{3})(\d{4})$/)
    if (match) return `+1 ${match[1]} ${match[2]} ${match[3]}`
    return str
  }

  const rawDisplayName = (contact) => {
    const raw = contact.name || contact.id || 'Unknown'
    // If it looks like a phone number, format it
    if (/^\+?\d{10,}$/.test(raw)) return formatPhone(raw)
    return normalizeName(raw)
  }

  const displayName = (name) => normalizeName(name).replace(/ /g, '\u2002')

  const wrapToLines = (text, maxChars) => {
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

  const fitNameToLines = (rawName, { maxWidth, baseSize, minSize, maxLines }) => {
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
      text: displayName(lines.join('\n')),
      fontSize,
      lineHeight,
    }
  }

  // Dynamic font size: shrink for longer identifiers to prevent truncation
  const podiumFontSize = (contact, isFirst) => {
    const name = contact.name || contact.id || ''
    const len = name.length
    const base = isFirst ? 22 : 20
    if (len > 26) return base - 7
    if (len > 22) return base - 6
    if (len > 18) return base - 4
    if (len > 14) return base - 2
    return base
  }

  const listFontSize = (contact) => {
    const name = contact.name || contact.id || ''
    const len = name.length
    if (len > 32) return 16
    if (len > 26) return 18
    if (len > 20) return 20
    if (len > 16) return 22
    return 26
  }

  const top3 = contacts.slice(0, 3)
  const rest = contacts.slice(3, 8)
  const maxTotal = top3[0]?.total || 1
  const firstName = rawDisplayName(top3[0] || {}).split(' ')[0] || 'them'

  return (
    <StoryCard>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <h2 style={{
          fontSize: 52,
          fontWeight: 800,
          margin: '0 0 10px 0',
          letterSpacing: '0.06em',
          wordSpacing: '0.2em',
        }}>
          Your Top People
        </h2>
        <p style={{
          fontSize: 24,
          color: 'rgba(255,255,255,0.35)',
          margin: '0 0 80px 0',
          letterSpacing: '0.04em',
          whiteSpace: 'pre',
        }}>
          {'Your most active conversations of 2025'}
        </p>

        {/* Podium */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 20,
          marginBottom: 24,
        }}>
          {[1, 0, 2].map((actualIndex) => {
            const contact = top3[actualIndex]
            if (!contact) return null
            const isFirst = actualIndex === 0
            const baseHeight = isFirst ? 230 : 190
            const dynamicHeight = baseHeight + (contact.total / maxTotal) * (isFirst ? 130 : 100)
            const cardWidth = isFirst ? 270 : 235
            const medals = ['🥇', '🥈', '🥉']
            const nameFontSize = podiumFontSize(contact, isFirst)
            const rawName = rawDisplayName(contact)
            const maxLines = rawName.length > 26 ? 3 : 2
            const nameLayout = fitNameToLines(rawName, {
              maxWidth: cardWidth - 56,
              baseSize: nameFontSize,
              minSize: 14,
              maxLines,
            })

            return (
              <div key={actualIndex} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}>
                {/* Medal */}
                <div style={{ fontSize: 36, marginBottom: 6 }}>
                  {medals[actualIndex]}
                </div>

                {/* Soft glow behind #1 */}
                {isFirst && (
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    borderRadius: 36,
                    background: 'radial-gradient(circle at 50% 55%, rgba(255,255,255,0.12) 0%, rgba(99,102,241,0.08) 35%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Card */}
                <div style={{
                  width: cardWidth,
                  height: dynamicHeight,
                  borderRadius: 24,
                  background: `linear-gradient(160deg, ${podiumColors[actualIndex][0]}, ${podiumColors[actualIndex][1]})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 12px',
                  boxSizing: 'border-box',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {/* Number — always prominent */}
                  <div style={{
                    fontSize: isFirst ? 52 : 42,
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}>
                    {formatNumber(contact.total)}
                  </div>
                  {/* Name pill — wraps to 2 lines, dynamic font */}
                  <div style={{
                    marginTop: 10,
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.2)',
                    maxWidth: cardWidth - 40,
                    boxSizing: 'border-box',
                  }}>
                    <div style={{
                      fontSize: nameLayout.fontSize,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.95)',
                      textAlign: 'center',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      lineHeight: nameLayout.lineHeight,
                    }}>
                      {nameLayout.text}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Narrative line */}
        <div style={{
          textAlign: 'center',
          fontSize: 24,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 56,
          fontStyle: 'italic',
          whiteSpace: 'pre',
        }}>
          {'You\u2002talked\u2002to\u2002' + firstName + '\u2002more\u2002than\u2002anyone\u2002else\u2002this\u2002year.'}
        </div>

        {/* Section label */}
        <div style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 20,
          whiteSpace: 'pre',
          wordSpacing: '0.3em',
        }}>
          More top conversations
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {rest.map((contact, index) => {
            const fontSize = listFontSize(contact)
            const rawName = rawDisplayName(contact)
            const maxLines = rawName.length > 32 ? 3 : 2
            const nameLayout = fitNameToLines(rawName, {
              maxWidth: 520,
              baseSize: fontSize,
              minSize: 14,
              maxLines,
            })
            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '22px 24px',
                borderBottom: index < rest.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <span style={{
                  fontSize: 22,
                  color: 'rgba(255,255,255,0.2)',
                  width: 44,
                  fontWeight: 500,
                  flexShrink: 0,
                  textAlign: 'center',
                }}>
                  {'#'}{index + 4}
                </span>
                <span style={{
                  fontSize: nameLayout.fontSize,
                  fontWeight: 500,
                  flex: 1,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: nameLayout.lineHeight,
                  minWidth: 0,
                }}>
                  {nameLayout.text}
                </span>
                <span style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#c084fc',
                  flexShrink: 0,
                  textAlign: 'right',
                  minWidth: 80,
                }}>
                  {formatNumber(contact.total)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer context */}
        <div style={{
          marginTop: 32,
          textAlign: 'center',
          fontSize: 20,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.03em',
          whiteSpace: 'pre',
        }}>
          {'Based on total messages sent & received'}
        </div>
      </div>
    </StoryCard>
  )
}

export default TopContactsStoryCard
