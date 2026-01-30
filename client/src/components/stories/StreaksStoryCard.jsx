import StoryCard from './StoryCard'

function StreaksStoryCard({ streaks }) {
  if (!streaks) return null

  const { summary, topStreaks } = streaks
  const longest = summary?.longestOverallStreak

  return (
    <StoryCard>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <h2 style={{ fontSize: 56, fontWeight: 700, margin: '0 0 12px 0', wordSpacing: '0.2em' }}>Your Streaks</h2>
        <p style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)', margin: '0 0 60px 0', letterSpacing: '0.02em', wordSpacing: '0.3em' }}>
          Consecutive days messaging
        </p>

        {/* Big streak highlight */}
        <div style={{
          textAlign: 'center',
          paddingTop: 40,
          paddingBottom: 60,
        }}>
          <div style={{ fontSize: 100, marginBottom: 24 }}>🔥</div>
          <div style={{
            fontSize: 180,
            fontWeight: 800,
            lineHeight: 1,
            color: '#f97316',
          }}>
            {longest?.days || 0}
          </div>
          <div style={{ fontSize: 36, color: 'rgba(255,255,255,0.6)', marginTop: 56, letterSpacing: '0.02em', wordSpacing: '0.3em' }}>
            day longest streak
          </div>
          {longest?.name && (
            <div style={{ fontSize: 32, fontWeight: 600, marginTop: 16, color: '#fb923c' }}>
              {'with ' + longest.name}
            </div>
          )}
        </div>

        {/* Top 5 streaks list */}
        {topStreaks && topStreaks.length > 1 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topStreaks.slice(0, 5).map((streak, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '20px 24px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 16,
                }}>
                  <span style={{ fontSize: 28, width: 44, textAlign: 'center' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '#' + (index + 1)}
                  </span>
                  <span style={{ fontSize: 26, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {streak.name}
                  </span>
                  <span style={{ fontSize: 28, fontWeight: 600, color: '#fb923c' }}>
                    {streak.longestStreak + 'd'}
                  </span>
                  {streak.isActive && (
                    <span style={{
                      fontSize: 18,
                      background: 'rgba(34,197,94,0.2)',
                      color: '#4ade80',
                      borderRadius: 20,
                      padding: '4px 14px',
                    }}>
                      active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
          {[
            { label: 'Active Streaks', value: String(summary?.activeStreakCount || 0), color: '#4ade80' },
            { label: 'Avg Length', value: (summary?.averageStreakLength || 0) + 'd', color: '#fb923c' },
          ].map((item) => (
            <div key={item.label} style={{
              flex: 1,
              textAlign: 'center',
              padding: '28px 16px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: 44, fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 10, wordSpacing: '0.3em' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </StoryCard>
  )
}

export default StreaksStoryCard
