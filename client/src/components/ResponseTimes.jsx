import { useState, useEffect } from 'react'

function ResponseTimes() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResponseTimes()
  }, [])

  const fetchResponseTimes = async () => {
    try {
      const res = await fetch('/api/response-times')
      const data = await res.json()
      setData(data)
    } catch (err) {
      console.error('Error fetching response times:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return 'N/A'
    if (minutes < 1) return '< 1 min'
    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = minutes / 60
    if (hours < 24) return `${hours.toFixed(1)} hrs`
    return `${(hours / 24).toFixed(1)} days`
  }

  const getSpeedEmoji = (minutes) => {
    if (minutes < 5) return '⚡'
    if (minutes < 30) return '🏃'
    if (minutes < 60) return '🚶'
    if (minutes < 240) return '🐢'
    return '💤'
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Response Times</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Response Times</h2>
      <p className="text-white/60 mb-6">How fast do you text back?</p>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📤</span>
            <div>
              <p className="text-white/60 text-sm">Your Average Response Time</p>
              <p className="text-3xl font-bold text-white">
                {formatTime(data?.overallMyAvgMinutes)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSpeedEmoji(data?.overallMyAvgMinutes)}</span>
            <span className="text-white/60">
              {data?.overallMyAvgMinutes < 30 ? 'Quick responder!' : 'Take your time, right?'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📥</span>
            <div>
              <p className="text-white/60 text-sm">Others' Average Response Time</p>
              <p className="text-3xl font-bold text-white">
                {formatTime(data?.overallTheirAvgMinutes)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSpeedEmoji(data?.overallTheirAvgMinutes)}</span>
            <span className="text-white/60">
              {data?.overallTheirAvgMinutes < data?.overallMyAvgMinutes
                ? 'They reply faster than you!'
                : 'You reply faster than them!'}
            </span>
          </div>
        </div>
      </div>

      {/* Fastest Replies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> You Reply Fastest To
          </h3>
          <div className="space-y-3">
            {data?.fastestRepliesTo?.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="text-white">{contact.name || contact.id || 'Unknown'}</span>
                </div>
                <div className="text-right">
                  <span className="text-purple-400 font-semibold">
                    {formatTime(contact.myAvgResponse)}
                  </span>
                </div>
              </div>
            ))}
            {(!data?.fastestRepliesTo || data.fastestRepliesTo.length === 0) && (
              <p className="text-white/40 text-center py-4">Not enough data</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> Fastest Repliers To You
          </h3>
          <div className="space-y-3">
            {data?.fastestRepliersFrom?.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="text-white">{contact.name || contact.id || 'Unknown'}</span>
                </div>
                <div className="text-right">
                  <span className="text-cyan-400 font-semibold">
                    {formatTime(contact.theirAvgResponse)}
                  </span>
                </div>
              </div>
            ))}
            {(!data?.fastestRepliersFrom || data.fastestRepliersFrom.length === 0) && (
              <p className="text-white/40 text-center py-4">Not enough data</p>
            )}
          </div>
        </div>
      </div>

      {/* Fun Fact */}
      {data?.overallMyAvgMinutes && data?.overallTheirAvgMinutes && (
        <div className="mt-6 bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white/60">
            {data.overallMyAvgMinutes < data.overallTheirAvgMinutes
              ? `You reply ${((data.overallTheirAvgMinutes - data.overallMyAvgMinutes) / data.overallTheirAvgMinutes * 100).toFixed(0)}% faster than the people you text!`
              : `Your friends reply ${((data.overallMyAvgMinutes - data.overallTheirAvgMinutes) / data.overallMyAvgMinutes * 100).toFixed(0)}% faster than you do!`}
          </p>
        </div>
      )}
    </div>
  )
}

export default ResponseTimes
