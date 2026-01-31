import { useApiData } from '../hooks/useApiData'

const streakGradients = [
  ['#f97316', '#ef4444'], // orange-red (fire)
  ['#f59e0b', '#f97316'], // amber-orange
  ['#eab308', '#f59e0b'], // yellow-amber
  ['#84cc16', '#eab308'], // lime-yellow
  ['#22c55e', '#84cc16'], // green-lime
]

function Streaks() {
  const { data, loading } = useApiData('/api/streaks')

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getMilestoneIcon = (milestone) => {
    if (milestone >= 365) return '💎'
    if (milestone >= 100) return '🏆'
    if (milestone >= 30) return '🛡️'
    return '⭐'
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Streaks</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  if (!data) return null

  const { topStreaks, streakStories, biggestStreakDeaths, summary } = data

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Streaks</h2>
      <p className="text-white/60 mb-6">Your messaging streaks</p>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card gradient-1">
          <p className="text-white/80 text-sm uppercase tracking-wide">Longest Streak</p>
          <p className="text-4xl font-bold text-white mt-2">
            {summary?.longestOverallStreak?.days || 0}
          </p>
          <p className="text-white/60 text-sm mt-1 truncate">
            {summary?.longestOverallStreak?.name || 'N/A'}
          </p>
        </div>
        <div className="stat-card gradient-2">
          <p className="text-white/80 text-sm uppercase tracking-wide">Active Streaks</p>
          <p className="text-4xl font-bold text-white mt-2">
            {summary?.activeStreakCount || 0}
          </p>
          <p className="text-white/60 text-sm mt-1">
            {summary?.longestActiveStreak
              ? `Best: ${summary.longestActiveStreak.days}d`
              : 'None active'}
          </p>
        </div>
        <div className="stat-card gradient-4">
          <p className="text-white/80 text-sm uppercase tracking-wide">Avg Streak</p>
          <p className="text-4xl font-bold text-white mt-2">
            {summary?.averageStreakLength || 0}
          </p>
          <p className="text-white/60 text-sm mt-1">days per streak</p>
        </div>
      </div>

      {/* Streak Leaderboard */}
      {topStreaks && topStreaks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔥</span> Streak Leaderboard
          </h3>

          {/* Top 3 Podium */}
          <div className="flex justify-center items-end gap-4 mb-6">
            {topStreaks.slice(0, 3).map((_, index) => {
              const positions = [1, 0, 2]
              const actualIndex = positions[index]
              const contact = topStreaks[actualIndex]
              if (!contact) return null
              const heights = ['h-32', 'h-24', 'h-20']

              return (
                <div key={actualIndex} className="flex flex-col items-center">
                  <div className={`text-3xl mb-1 ${actualIndex === 0 ? 'animate-pulse-slow' : ''}`}>
                    🔥
                  </div>
                  <div
                    className={`w-24 ${heights[actualIndex]} rounded-t-lg flex flex-col items-center justify-center px-2`}
                    style={{
                      background: `linear-gradient(135deg, ${streakGradients[actualIndex][0]}, ${streakGradients[actualIndex][1]})`
                    }}
                  >
                    <p className="text-white font-bold text-lg">{contact.longestStreak}d</p>
                    <p className="text-white/80 text-xs text-center truncate w-full">
                      {contact.name}
                    </p>
                    {contact.isActive && (
                      <span className="text-[10px] bg-white/20 rounded px-1 mt-0.5">active</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* #4-#10 List */}
          {topStreaks.length > 3 && (
            <div className="space-y-2">
              {topStreaks.slice(3).map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-sm w-6">#{index + 4}</span>
                    <span className="text-lg">🔥</span>
                    <span className="text-white">{contact.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-semibold">{contact.longestStreak} days</span>
                    {contact.isActive && (
                      <span className="text-xs bg-green-500/20 text-green-400 rounded-full px-2 py-0.5">
                        active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Streak Story Cards */}
      {streakStories && streakStories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📖</span> Top Streak Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streakStories.map((story, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 relative overflow-hidden"
              >
                {story.isActive && (
                  <div className="absolute top-2 right-2 text-xl animate-pulse-slow">🔥</div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-orange-400">{story.longestStreak}</span>
                  <span className="text-white/60 text-sm">days</span>
                </div>
                <p className="text-white font-semibold mb-1">{story.name}</p>
                <p className="text-white/40 text-xs mb-3">
                  {formatDate(story.longestStreakStart)} — {formatDate(story.longestStreakEnd)}
                </p>
                {story.milestonesReached && story.milestonesReached.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {story.milestonesReached.map(m => (
                      <span
                        key={m}
                        className="text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/70"
                        title={`Reached ${m} days on ${story.milestoneUnlockDates?.[m] || 'N/A'}`}
                      >
                        {getMilestoneIcon(m)} {m}d
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biggest Streak Deaths */}
      {biggestStreakDeaths && biggestStreakDeaths.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💀</span> Biggest Streak Deaths
          </h3>
          <div className="space-y-3">
            {biggestStreakDeaths.map((death, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🪦</span>
                  <div>
                    <p className="text-white font-medium">{death.name}</p>
                    <p className="text-white/40 text-xs">Ended {formatDate(death.endDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-semibold">{death.streakLength} days</p>
                  <p className="text-xs text-white/40">
                    {death.whoLetItDie === 'you' ? 'You let it die' : 'They let it die'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak Survivor - Longest Active Streak */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🏅</span> Streak Survivor
        </h3>
        {summary?.longestActiveStreak ? (
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2 animate-pulse-slow">🔥</div>
            <p className="text-3xl font-bold text-white">{summary.longestActiveStreak.days} days</p>
            <p className="text-green-400 font-semibold mt-1">{summary.longestActiveStreak.name}</p>
            <p className="text-white/40 text-sm mt-1">
              Since {formatDate(summary.longestActiveStreak.start)}
            </p>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-6 text-center">
            <p className="text-white/40">No active streaks right now</p>
            <p className="text-white/20 text-sm mt-1">Send and receive messages on consecutive days to start one!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Streaks
