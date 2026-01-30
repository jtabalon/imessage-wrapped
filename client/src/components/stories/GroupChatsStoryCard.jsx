import StoryCard from './StoryCard'

const podiumColors = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
]

function GroupChatsStoryCard({ groupChats }) {
  if (!groupChats || !groupChats.leaderboard || groupChats.leaderboard.length === 0) return null

  const { leaderboard, personalities } = groupChats

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const top3 = leaderboard.slice(0, 3)
  const totalMessages = leaderboard.reduce((sum, g) => sum + g.totalMessages, 0)

  return (
    <StoryCard>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <h2 style={{ fontSize: 56, fontWeight: 700, margin: '0 0 12px 0', wordSpacing: '0.2em' }}>Group Chat Life</h2>
        <p style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)', margin: '0 0 60px 0', letterSpacing: '0.02em', wordSpacing: '0.3em' }}>
          Your most active group chats
        </p>

        {/* Top 3 cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {top3.map((group, index) => {
            const p = personalities?.[group.chatIdentifier]
            const medals = ['🥇', '🥈', '🥉']

            return (
              <div key={index} style={{
                background: `linear-gradient(135deg, ${podiumColors[index][0]}22, ${podiumColors[index][1]}22)`,
                border: `1px solid ${podiumColors[index][0]}44`,
                borderRadius: 24,
                padding: '32px 36px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: p ? 20 : 0 }}>
                  <span style={{ fontSize: 44 }}>{medals[index]}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      fontSize: 32,
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {group.chatName}
                    </div>
                    <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 4, wordSpacing: '0.2em' }}>
                      {group.memberCount + ' members'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 36, fontWeight: 700, color: podiumColors[index][0] }}>
                      {formatNumber(group.totalMessages)}
                    </div>
                    <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>
                      {'You: ' + group.myPercentage + '%'}
                    </div>
                  </div>
                </div>

                {/* Personality tags */}
                {p && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {p.mostTalkative && (
                      <span style={{
                        fontSize: 20,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: '6px 16px',
                        color: 'rgba(255,255,255,0.7)',
                      }}>
                        {'📢 ' + p.mostTalkative.name}
                      </span>
                    )}
                    {p.lurker && (
                      <span style={{
                        fontSize: 20,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: '6px 16px',
                        color: 'rgba(255,255,255,0.7)',
                      }}>
                        {'👀 ' + p.lurker.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Total stat */}
        <div style={{
          textAlign: 'center',
          padding: '32px 24px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 20,
          marginTop: 50,
        }}>
          <div style={{ fontSize: 44, fontWeight: 700, color: '#c084fc' }}>
            {formatNumber(totalMessages)}
          </div>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', marginTop: 10, letterSpacing: '0.02em', wordSpacing: '0.3em' }}>
            total group messages
          </div>
        </div>
      </div>
    </StoryCard>
  )
}

export default GroupChatsStoryCard
