import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { useApiData } from '../hooks/useApiData'

function SentimentAnalysis() {
  const { data, loading } = useApiData('/api/sentiment')

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const getMoodEmoji = (score) => {
    const numScore = parseFloat(score)
    if (numScore > 5) return '😄'
    if (numScore > 2) return '🙂'
    if (numScore > -2) return '😐'
    if (numScore > -5) return '😕'
    return '😢'
  }

  const getMoodLabel = (score) => {
    const numScore = parseFloat(score)
    if (numScore > 5) return 'Very Positive'
    if (numScore > 2) return 'Positive'
    if (numScore > -2) return 'Neutral'
    if (numScore > -5) return 'Slightly Negative'
    return 'Negative'
  }

  const COLORS = ['#43e97b', '#667eea', '#f5576c']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-white/60">
            Score: <span className={parseFloat(data.positivityScore) > 0 ? 'text-green-400' : 'text-red-400'}>
              {data.positivityScore}%
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Conversation Mood</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  const pieData = data?.overall ? [
    { name: 'Positive', value: data.overall.positive },
    { name: 'Neutral', value: data.overall.neutral },
    { name: 'Negative', value: data.overall.negative },
  ] : []

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Conversation Mood</h2>
      <p className="text-white/60 mb-6">The emotional tone of your messages</p>

      {/* Overall Mood */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-8xl mb-4">{getMoodEmoji(data?.overall?.positivityScore)}</div>
          <p className="text-2xl font-bold text-white">{getMoodLabel(data?.overall?.positivityScore)}</p>
          <p className="text-white/60">
            Positivity Score: <span className={parseFloat(data?.overall?.positivityScore) > 0 ? 'text-green-400' : 'text-red-400'}>
              {data?.overall?.positivityScore}%
            </span>
          </p>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-500/20 rounded-lg p-4 text-center">
          <p className="text-green-400 text-2xl font-bold">{formatNumber(data?.overall?.positive)}</p>
          <p className="text-white/60 text-sm">Positive Messages</p>
        </div>
        <div className="bg-purple-500/20 rounded-lg p-4 text-center">
          <p className="text-purple-400 text-2xl font-bold">{formatNumber(data?.overall?.neutral)}</p>
          <p className="text-white/60 text-sm">Neutral Messages</p>
        </div>
        <div className="bg-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400 text-2xl font-bold">{formatNumber(data?.overall?.negative)}</p>
          <p className="text-white/60 text-sm">Negative Messages</p>
        </div>
      </div>

      {/* Mood Over Time */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Mood Throughout the Year</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.monthlyTrend}>
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
                dataKey="positivityScore"
                stroke="#43e97b"
                strokeWidth={3}
                dot={{ fill: '#43e97b', r: 4 }}
                activeDot={{ r: 6, fill: '#38f9d7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Positive/Negative Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>☀️</span> Most Positive Conversations
          </h3>
          <div className="space-y-3">
            {data?.mostPositiveContacts?.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-green-500/10 rounded-lg p-3"
              >
                <span className="text-white">{contact.name || contact.contactId || 'Unknown'}</span>
                <span className="text-green-400 font-semibold">+{contact.positivityScore}%</span>
              </div>
            ))}
            {(!data?.mostPositiveContacts || data.mostPositiveContacts.length === 0) && (
              <p className="text-white/40 text-center py-4">Not enough data</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🌧️</span> Most Challenging Conversations
          </h3>
          <div className="space-y-3">
            {data?.mostNegativeContacts?.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-red-500/10 rounded-lg p-3"
              >
                <span className="text-white">{contact.name || contact.contactId || 'Unknown'}</span>
                <span className="text-red-400 font-semibold">{contact.positivityScore}%</span>
              </div>
            ))}
            {(!data?.mostNegativeContacts || data.mostNegativeContacts.length === 0) && (
              <p className="text-white/40 text-center py-4">Not enough data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SentimentAnalysis
