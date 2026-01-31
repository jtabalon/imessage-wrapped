import StoryCard from './StoryCard'
import { formatNumber, normalizeName, displayName, fitNameToLines } from './storyUtils'

const podiumColors = [
  ['#6366f1', '#8b5cf6'],  // #1 — vibrant indigo-purple
  ['#c9a0c8', '#c5848e'],  // #2 — muted pink
  ['#7aaec0', '#72bec2'],  // #3 — muted teal
]

function GroupChatsStoryCard({ groupChats }) {
  if (!groupChats || !groupChats.leaderboard || groupChats.leaderboard.length === 0) return null

  const { leaderboard, personalities } = groupChats

  const top3 = leaderboard.slice(0, 3)
  const totalMessages = leaderboard.reduce((sum, g) => sum + g.totalMessages, 0)

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
          Group Chat Life
        </h2>
        <p style={{
          fontSize: 26,
          color: 'rgba(255,255,255,0.35)',
          margin: '0 0 60px 0',
          letterSpacing: '0.04em',
          whiteSpace: 'pre',
        }}>
          {'Your most active group chats'}
        </p>

        {/* Top 3 cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {top3.map((group, index) => {
            const p = personalities?.[group.chatIdentifier]
            const medals = ['🥇', '🥈', '🥉']
            const rawName = normalizeName(group.chatName || 'Unknown')
            const nameLayout = fitNameToLines(rawName, {
              maxWidth: 420,
              baseSize: 32,
              minSize: 18,
              maxLines: 2,
            })

            return (
              <div key={index} style={{
                background: `linear-gradient(135deg, ${podiumColors[index][0]}22, ${podiumColors[index][1]}22)`,
                border: `1px solid ${podiumColors[index][0]}44`,
                borderRadius: 24,
                padding: '32px 36px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: p ? 20 : 0 }}>
                  <span style={{ fontSize: 44 }}>{medals[index]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: nameLayout.fontSize,
                      fontWeight: 700,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      lineHeight: nameLayout.lineHeight,
                    }}>
                      {nameLayout.text}
                    </div>
                    <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 4, wordSpacing: '0.2em' }}>
                      {group.memberCount + ' members'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 36, fontWeight: 700, color: podiumColors[index][0] }}>
                      {formatNumber(group.totalMessages)}
                    </div>
                    <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', whiteSpace: 'pre' }}>
                      {'You:\u2002' + group.myPercentage + '%'}
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
                        whiteSpace: 'pre',
                      }}>
                        {'📢\u2002' + displayName(p.mostTalkative.name)}
                      </span>
                    )}
                    {p.lurker && (
                      <span style={{
                        fontSize: 20,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: '6px 16px',
                        color: 'rgba(255,255,255,0.7)',
                        whiteSpace: 'pre',
                      }}>
                        {'👀\u2002' + displayName(p.lurker.name)}
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
          marginTop: 50,
        }}>
          <div style={{ fontSize: 44, fontWeight: 700, color: '#c084fc' }}>
            {formatNumber(totalMessages)}
          </div>
          <div style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 10,
            letterSpacing: '0.02em',
            wordSpacing: '0.3em',
            whiteSpace: 'pre',
          }}>
            {'total\u2002group\u2002messages'}
          </div>
        </div>

        {/* Footer context */}
        <div style={{
          marginTop: 16,
          textAlign: 'center',
          fontSize: 20,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.03em',
          whiteSpace: 'pre',
        }}>
          {'Based on group chat activity in 2025'}
        </div>
      </div>
    </StoryCard>
  )
}

export default GroupChatsStoryCard
