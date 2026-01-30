import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

function ActivityChart() {
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('monthly') // monthly, hourly, dayOfWeek, heatmap

  useEffect(() => {
    fetchActivity()
  }, [])

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity')
      const data = await res.json()
      setActivity(data)
    } catch (err) {
      console.error('Error fetching activity:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-purple-400">{formatNumber(payload[0].value)} messages</p>
        </div>
      )
    }
    return null
  }

  const getHeatmapColor = (count, max) => {
    if (!count || !max) return 'rgba(103, 126, 234, 0.1)'
    const intensity = count / max
    if (intensity > 0.8) return 'rgba(240, 147, 251, 0.9)'
    if (intensity > 0.6) return 'rgba(167, 139, 250, 0.8)'
    if (intensity > 0.4) return 'rgba(129, 140, 248, 0.7)'
    if (intensity > 0.2) return 'rgba(103, 126, 234, 0.5)'
    return 'rgba(103, 126, 234, 0.2)'
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">When You Message</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  // Calculate max for heatmap
  const maxHeatmap = activity?.heatmap
    ? Math.max(...activity.heatmap.flatMap(d => d.hours.map(h => h.count)))
    : 0

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">When You Message</h2>
          <p className="text-white/60">Your messaging patterns over time</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {['monthly', 'hourly', 'dayOfWeek', 'heatmap'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                view === v
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {v === 'dayOfWeek' ? 'Day of Week' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view === 'monthly' && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activity?.monthly}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.3)"
                tickFormatter={(v) => {
                  const [year, month] = v.split('-')
                  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                }}
              />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#667eea"
                fillOpacity={1}
                fill="url(#colorMessages)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'hourly' && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity?.hourly}>
              <XAxis
                dataKey="hour"
                stroke="rgba(255,255,255,0.3)"
                tickFormatter={(v) => `${v}:00`}
              />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {activity?.hourly.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index >= 9 && index <= 21 ? '#667eea' : '#764ba2'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'dayOfWeek' && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity?.dayOfWeek}>
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {activity?.dayOfWeek.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 || index === 6 ? '#f093fb' : '#667eea'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'heatmap' && (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex mb-2">
              <div className="w-20" />
              {[...Array(24)].map((_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-white/40">
                  {i % 3 === 0 ? `${i}:00` : ''}
                </div>
              ))}
            </div>
            {activity?.heatmap.map((dayData, dayIndex) => (
              <div key={dayIndex} className="flex items-center mb-1">
                <div className="w-20 text-sm text-white/60">{dayData.day.substring(0, 3)}</div>
                <div className="flex-1 flex gap-0.5">
                  {dayData.hours.map((hour, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="flex-1 h-6 rounded-sm transition-colors hover:ring-2 hover:ring-white/30"
                      style={{ backgroundColor: getHeatmapColor(hour.count, maxHeatmap) }}
                      title={`${dayData.day} ${hourIndex}:00 - ${formatNumber(hour.count)} messages`}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end mt-4 gap-2 text-xs text-white/40">
              <span>Less</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity) => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: getHeatmapColor(intensity * maxHeatmap, maxHeatmap) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityChart
