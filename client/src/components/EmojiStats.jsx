import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function EmojiStats() {
  const [emojis, setEmojis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmojis()
  }, [])

  const fetchEmojis = async () => {
    try {
      const res = await fetch('/api/emojis')
      const data = await res.json()
      setEmojis(data)
    } catch (err) {
      console.error('Error fetching emojis:', err)
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
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-purple-400">{formatNumber(data.totalEmojis)} emojis</p>
          {data.topEmoji && <p className="text-2xl mt-1">{data.topEmoji}</p>}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Your Emoji Universe</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Your Emoji Universe</h2>
      <p className="text-white/60 mb-6">Express yourself</p>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(emojis?.totalEmojis)}</p>
          <p className="text-white/60 text-sm">Total Emojis</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{emojis?.uniqueEmojis}</p>
          <p className="text-white/60 text-sm">Unique Emojis</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-5xl">{emojis?.topEmojis?.[0]?.emoji || '😀'}</p>
          <p className="text-white/60 text-sm">#1 Emoji</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">
            {emojis?.perDayAvg || 0}
          </p>
          <p className="text-white/60 text-sm">Per Day Avg</p>
        </div>
      </div>

      {/* Top Emojis Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Top 20 Emojis</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {emojis?.topEmojis?.map((item, index) => (
            <div
              key={index}
              className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
              title={`${item.emoji}: ${formatNumber(item.count)} times`}
            >
              <span className="text-2xl md:text-3xl">{item.emoji}</span>
              <span className="text-xs text-white/40 mt-1">{formatNumber(item.count)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Emoji Usage Over Time</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emojis?.monthlyTrend}>
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
              <Line
                type="monotone"
                dataKey="totalEmojis"
                stroke="#f093fb"
                strokeWidth={3}
                dot={{ fill: '#f093fb', r: 4 }}
                activeDot={{ r: 6, fill: '#f5576c' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Top Emojis */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Top Emoji Each Month</h3>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {emojis?.monthlyTrend?.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-2 text-center"
              title={item.month}
            >
              <p className="text-xs text-white/40">
                {new Date(parseInt(item.month.split('-')[0]), parseInt(item.month.split('-')[1]) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </p>
              <p className="text-2xl mt-1">{item.topEmoji || '❓'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmojiStats
