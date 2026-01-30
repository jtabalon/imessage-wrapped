import StoryCard from './StoryCard'

function TitleStoryCard({ stats }) {
  if (!stats) return null

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  return (
    <StoryCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Title */}
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.9 }}>💬</div>
        <h1 style={{
          fontSize: 80,
          fontWeight: 800,
          color: '#a78bfa',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.1,
        }}>
          iMessage
        </h1>
        <h1 style={{
          fontSize: 80,
          fontWeight: 800,
          color: '#f472b6',
          margin: '0 0 20px 0',
          textAlign: 'center',
          lineHeight: 1.1,
        }}>
          Wrapped
        </h1>
        <p style={{ fontSize: 30, color: 'rgba(255,255,255,0.5)', marginBottom: 120, textAlign: 'center', letterSpacing: '0.05em' }}>
          2025 in review
        </p>

        {/* Big number */}
        <div style={{ textAlign: 'center', marginBottom: 120 }}>
          <div style={{ fontSize: 160, fontWeight: 800, lineHeight: 1 }}>
            {formatNumber(stats.totalMessages)}
          </div>
          <div style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 48,
            letterSpacing: '0.02em',
            wordSpacing: '0.3em',
          }}>
            messages sent & received
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 32, width: '100%' }}>
          {[
            { label: 'Sent', value: formatNumber(stats.sent), color: '#f093fb' },
            { label: 'Received', value: formatNumber(stats.received), color: '#4facfe' },
            { label: 'Conversations', value: formatNumber(stats.uniqueConversations), color: '#43e97b' },
          ].map((item) => (
            <div key={item.label} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 16px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </StoryCard>
  )
}

export default TitleStoryCard
