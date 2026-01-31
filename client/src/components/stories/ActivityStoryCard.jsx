import StoryCard from './StoryCard'

function ActivityStoryCard({ activity }) {
  if (!activity) return null

  const heatmap = activity.heatmap || []
  const maxCount = heatmap.length > 0
    ? Math.max(...heatmap.flatMap(d => d.hours.map(h => h.count)))
    : 0

  const getColor = (count) => {
    if (!count || !maxCount) return 'rgba(103, 126, 234, 0.1)'
    const intensity = count / maxCount
    if (intensity > 0.8) return 'rgba(240, 147, 251, 0.9)'
    if (intensity > 0.6) return 'rgba(167, 139, 250, 0.8)'
    if (intensity > 0.4) return 'rgba(129, 140, 248, 0.7)'
    if (intensity > 0.2) return 'rgba(103, 126, 234, 0.5)'
    return 'rgba(103, 126, 234, 0.15)'
  }

  // Find peak hour and day
  const hourly = activity.hourly || []
  const dayOfWeek = activity.dayOfWeek || []
  const peakHour = hourly.reduce((max, h) => h.count > (max?.count || 0) ? h : max, null)
  const peakDay = dayOfWeek.reduce((max, d) => d.count > (max?.count || 0) ? d : max, null)

  const formatHour = (h) => {
    if (h === 0) return '12 AM'
    if (h === 12) return '12 PM'
    return h > 12 ? `${h - 12} PM` : `${h} AM`
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
          When You Message
        </h2>
        <p style={{
          fontSize: 26,
          color: 'rgba(255,255,255,0.35)',
          margin: '0 0 24px 0',
          letterSpacing: '0.04em',
          whiteSpace: 'pre',
        }}>
          {'Your messaging patterns'}
        </p>

        {/* Accent divider */}
        <div style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
          marginBottom: 40,
        }} />

        {/* Heatmap */}
        <div style={{ marginBottom: 60 }}>
          {/* Hour labels */}
          <div style={{ display: 'flex', marginLeft: 80, marginBottom: 10 }}>
            {[...Array(24)].map((_, i) => (
              <div key={i} style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 16,
                color: 'rgba(255,255,255,0.3)',
              }}>
                {i % 4 === 0 ? `${i}` : ''}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {heatmap.map((dayData, dayIndex) => (
            <div key={dayIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 80, fontSize: 24, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                {dayData.day.substring(0, 3)}
              </div>
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {dayData.hours.map((hour, hourIndex) => (
                  <div
                    key={hourIndex}
                    style={{
                      flex: 1,
                      height: 64,
                      borderRadius: 6,
                      background: getColor(hour.count),
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Color legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 24, gap: 10 }}>
            <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>Less</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity) => (
              <div
                key={intensity}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: getColor(intensity * maxCount),
                }}
              />
            ))}
            <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>More</span>
          </div>
        </div>

        {/* Peak callouts */}
        <div style={{ display: 'flex', gap: 0, width: '100%' }}>
          {[
            peakHour ? { label: 'Peak Hour', value: formatHour(peakHour.hour), color: '#c084fc' } : null,
            peakDay ? { label: 'Peak Day', value: peakDay.label, color: '#f093fb' } : null,
          ].filter(Boolean).map((item, index) => (
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
          {'Based on messages sent & received in 2025'}
        </div>
      </div>
    </StoryCard>
  )
}

export default ActivityStoryCard
