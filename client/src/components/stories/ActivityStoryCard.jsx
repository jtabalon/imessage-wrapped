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
        <h2 style={{ fontSize: 56, fontWeight: 700, margin: '0 0 12px 0' }}>When You Message</h2>
        <p style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)', margin: '0 0 40px 0', letterSpacing: '0.02em', wordSpacing: '0.3em' }}>
          Your messaging patterns
        </p>

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
        <div style={{ display: 'flex', gap: 24 }}>
          {peakHour && (
            <div style={{
              flex: 1,
              padding: '32px 24px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 20,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginBottom: 12, wordSpacing: '0.3em' }}>
                Peak Hour
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, color: '#c084fc' }}>
                {formatHour(peakHour.hour)}
              </div>
            </div>
          )}
          {peakDay && (
            <div style={{
              flex: 1,
              padding: '32px 24px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 20,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginBottom: 12, wordSpacing: '0.3em' }}>
                Peak Day
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, color: '#f093fb' }}>
                {peakDay.label}
              </div>
            </div>
          )}
        </div>
      </div>
    </StoryCard>
  )
}

export default ActivityStoryCard
