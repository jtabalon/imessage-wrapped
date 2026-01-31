import StoryCard from './StoryCard'
import { normalizeName, displayName, fitNameToLines } from './storyUtils'

function StreaksStoryCard({ streaks }) {
  if (!streaks) return null

  const { summary, topStreaks } = streaks
  const longest = summary?.longestOverallStreak

  const listFontSize = (streak) => {
    const name = streak.name || ''
    const len = name.length
    if (len > 32) return 18
    if (len > 26) return 20
    if (len > 20) return 22
    if (len > 16) return 24
    return 26
  }

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
          Your Streaks
        </h2>
        <p style={{
          fontSize: 26,
          color: 'rgba(255,255,255,0.35)',
          margin: '0 0 24px 0',
          letterSpacing: '0.04em',
          whiteSpace: 'pre',
        }}>
          {'Consecutive days messaging'}
        </p>

        {/* Accent divider (orange gradient for fire/streak theme) */}
        <div style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #f97316, #fb923c)',
          marginBottom: 40,
        }} />

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
          <div style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 56,
            letterSpacing: '0.02em',
            wordSpacing: '0.3em',
            whiteSpace: 'pre',
          }}>
            {'day\u2002longest\u2002streak'}
          </div>
          {longest?.name && (
            <div style={{
              fontSize: 32,
              fontWeight: 600,
              marginTop: 16,
              color: '#fb923c',
              whiteSpace: 'pre',
            }}>
              {'with\u2002' + displayName(longest.name)}
            </div>
          )}
        </div>

        {/* Top 5 streaks list */}
        {topStreaks && topStreaks.length > 1 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {topStreaks.slice(0, 5).map((streak, index) => {
                const fontSize = listFontSize(streak)
                const rawName = normalizeName(streak.name || 'Unknown')
                const maxLines = rawName.length > 32 ? 3 : 2
                const nameLayout = fitNameToLines(rawName, {
                  maxWidth: 440,
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
                    borderBottom: index < Math.min(topStreaks.length, 5) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <span style={{
                      fontSize: 28,
                      width: 44,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '#' + (index + 1)}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
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
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: 0, width: '100%', marginTop: 40 }}>
          {[
            { label: 'Active Streaks', value: String(summary?.activeStreakCount || 0), color: '#4ade80' },
            { label: 'Avg Length', value: (summary?.averageStreakLength || 0) + 'd', color: '#fb923c' },
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
          {'Based on consecutive days with messages'}
        </div>
      </div>
    </StoryCard>
  )
}

export default StreaksStoryCard
