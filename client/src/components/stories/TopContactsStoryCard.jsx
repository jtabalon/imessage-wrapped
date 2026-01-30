import StoryCard from './StoryCard'

const podiumColors = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
]

function TopContactsStoryCard({ contacts }) {
  if (!contacts || contacts.length === 0) return null

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const top3 = contacts.slice(0, 3)
  const rest = contacts.slice(3, 8)
  const maxTotal = top3[0]?.total || 1

  return (
    <StoryCard>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <h2 style={{ fontSize: 56, fontWeight: 700, margin: '0 0 12px 0', wordSpacing: '0.2em' }}>Your Top People</h2>
        <p style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)', margin: '0 0 60px 0', letterSpacing: '0.02em', wordSpacing: '0.3em' }}>
          Who you talked to most in 2025
        </p>

        {/* Podium */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 24, marginBottom: 60 }}>
          {[1, 0, 2].map((actualIndex) => {
            const contact = top3[actualIndex]
            if (!contact) return null
            const heightPx = 180 + (contact.total / maxTotal) * 120
            const medals = ['🥇', '🥈', '🥉']

            return (
              <div key={actualIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>
                  {medals[actualIndex]}
                </div>
                <div style={{
                  width: 240,
                  height: heightPx,
                  borderRadius: '20px 20px 0 0',
                  background: `linear-gradient(135deg, ${podiumColors[actualIndex][0]}, ${podiumColors[actualIndex][1]})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 16px',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ fontSize: 44, fontWeight: 700 }}>{formatNumber(contact.total)}</div>
                  <div style={{
                    fontSize: 22,
                    color: 'rgba(255,255,255,0.85)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    marginTop: 8,
                  }}>
                    {contact.name || contact.id || 'Unknown'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rest of list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rest.map((contact, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '22px 28px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
            }}>
              <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)', width: 50, fontWeight: 600 }}>
                {'#'}{index + 4}
              </span>
              <span style={{ fontSize: 28, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contact.name || contact.id || 'Unknown'}
              </span>
              <span style={{ fontSize: 28, fontWeight: 600, color: '#c084fc' }}>
                {formatNumber(contact.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </StoryCard>
  )
}

export default TopContactsStoryCard
