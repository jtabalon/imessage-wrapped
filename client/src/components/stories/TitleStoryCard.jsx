import StoryCard from './StoryCard'
import { formatNumber } from './storyUtils'

function TitleStoryCard({ stats }) {
  if (!stats) return null

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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 160, fontWeight: 800, lineHeight: 1 }}>
            {formatNumber(stats.totalMessages)}
          </div>
          <div style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 48,
            letterSpacing: '0.02em',
            wordSpacing: '0.3em',
          }}>
            messages sent & received
          </div>
        </div>

        {/* Accent divider */}
        <div style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
          marginBottom: 40,
        }} />

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, width: '100%' }}>
          {[
            { label: 'Sent', value: formatNumber(stats.sent), color: '#f093fb' },
            { label: 'Received', value: formatNumber(stats.received), color: '#4facfe' },
            { label: 'Conversations', value: formatNumber(stats.uniqueConversations), color: '#43e97b' },
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
