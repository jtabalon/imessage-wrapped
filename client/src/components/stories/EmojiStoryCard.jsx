import StoryCard from './StoryCard'

function EmojiStoryCard({ emojis }) {
  if (!emojis) return null

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const topEmojis = emojis.topEmojis || []

  return (
    <StoryCard>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <h2 style={{
          fontSize: 56,
          fontWeight: 800,
          margin: '0 0 12px 0',
          letterSpacing: '0.06em',
          wordSpacing: '0.2em',
        }}>
          Your Emoji Universe
        </h2>
        <p style={{
          fontSize: 26,
          color: 'rgba(255,255,255,0.35)',
          margin: '0 0 40px 0',
          letterSpacing: '0.04em',
          whiteSpace: 'pre',
        }}>
          {'Express yourself'}
        </p>

        {/* Giant #1 emoji */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 200 }}>
            {topEmojis[0]?.emoji || '🙂'}
          </div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', marginTop: 16, letterSpacing: '0.02em', wordSpacing: '0.2em' }}>
            {'#1 Emoji \u2014 used ' + formatNumber(topEmojis[0]?.count) + ' times'}
          </div>
        </div>

        {/* Accent divider */}
        <div style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
          alignSelf: 'center',
          marginBottom: 40,
        }} />

        {/* Top 9 grid (3x3) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 80,
        }}>
          {topEmojis.slice(1, 10).map((item, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: '28px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 72 }}>{item.emoji}</div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
                {formatNumber(item.count)}
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, width: '100%' }}>
          {[
            { label: 'Total Emojis', value: formatNumber(emojis.totalEmojis), color: '#f093fb' },
            { label: 'Unique', value: String(emojis.uniqueEmojis), color: '#4facfe' },
            { label: 'Per Day', value: String(emojis.perDayAvg || 0), color: '#43e97b' },
          ].map((item, index) => (
            <div key={item.label} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 16px',
              borderLeft: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}>
              <div style={{ fontSize: 44, fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 10, wordSpacing: '0.3em' }}>{item.label}</div>
            </div>
          ))}
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
          {'Based on emoji usage in 2025'}
        </div>
      </div>
    </StoryCard>
  )
}

export default EmojiStoryCard
