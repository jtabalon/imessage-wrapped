import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts'

const gradients = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#30cfd0', '#330867'],
  ['#ff0844', '#ffb199'],
  ['#00c6fb', '#005bea'],
  ['#f83600', '#f9d423'],
]

function GroupChats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState(null)

  useEffect(() => {
    fetchGroupChats()
  }, [])

  const fetchGroupChats = async () => {
    try {
      const res = await fetch('/api/group-chats')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Error fetching group chats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white font-semibold">{d.name}</p>
          <p className="text-purple-400">{formatNumber(d.count)} messages</p>
        </div>
      )
    }
    return null
  }

  const AreaTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white font-semibold">{d.month}</p>
          <p className="text-cyan-400">{formatNumber(d.count)} messages</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Group Chats</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  if (!data || !data.leaderboard || data.leaderboard.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-2">Group Chats</h2>
        <p className="text-white/60">No group chats found in your messages.</p>
      </div>
    )
  }

  const { leaderboard, personalities, deepDive } = data
  const top1 = leaderboard[0]
  const totalGroupMessages = leaderboard.reduce((sum, g) => sum + g.totalMessages, 0)
  const selectedDeepDive = selectedChat ? deepDive[selectedChat] : null
  const selectedName = selectedChat
    ? leaderboard.find(g => g.chatIdentifier === selectedChat)?.chatName
    : null
  const hasDeepDive = (chatId) => !!deepDive[chatId]

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Group Chats</h2>
      <p className="text-white/60 mb-6">Your group chat life</p>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card gradient-1">
          <p className="text-white/80 text-sm uppercase tracking-wide">Group Chats</p>
          <p className="text-4xl font-bold text-white mt-2">{leaderboard.length}</p>
          <p className="text-white/60 text-sm mt-1">top active</p>
        </div>
        <div className="stat-card gradient-2">
          <p className="text-white/80 text-sm uppercase tracking-wide">Group Messages</p>
          <p className="text-4xl font-bold text-white mt-2">{formatNumber(totalGroupMessages)}</p>
          <p className="text-white/60 text-sm mt-1">across all groups</p>
        </div>
        <div className="stat-card gradient-3">
          <p className="text-white/80 text-sm uppercase tracking-wide">Most Active</p>
          <p className="text-4xl font-bold text-white mt-2">{formatNumber(top1.totalMessages)}</p>
          <p className="text-white/60 text-sm mt-1 truncate">{top1.chatName}</p>
        </div>
        <div className="stat-card gradient-5">
          <p className="text-white/80 text-sm uppercase tracking-wide">Your Share in #1</p>
          <p className="text-4xl font-bold text-white mt-2">{top1.myPercentage}%</p>
          <p className="text-white/60 text-sm mt-1">{formatNumber(top1.myMessages)} messages</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>💬</span> Group Chat Leaderboard
        </h3>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-4 mb-6">
          {leaderboard.slice(0, 3).map((_, index) => {
            const positions = [1, 0, 2]
            const actualIndex = positions[index]
            const group = leaderboard[actualIndex]
            if (!group) return null
            const heights = ['h-32', 'h-24', 'h-20']
            const isClickable = hasDeepDive(group.chatIdentifier)

            return (
              <div
                key={actualIndex}
                className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => isClickable && setSelectedChat(
                  selectedChat === group.chatIdentifier ? null : group.chatIdentifier
                )}
              >
                <div className={`text-3xl mb-1 ${actualIndex === 0 ? 'animate-pulse-slow' : ''}`}>
                  💬
                </div>
                <div
                  className={`w-24 ${heights[actualIndex]} rounded-t-lg flex flex-col items-center justify-center px-2 ${
                    selectedChat === group.chatIdentifier ? 'ring-2 ring-white/50' : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${gradients[actualIndex][0]}, ${gradients[actualIndex][1]})`
                  }}
                >
                  <p className="text-white font-bold text-lg">{formatNumber(group.totalMessages)}</p>
                  <p className="text-white/80 text-xs text-center truncate w-full">
                    {group.chatName}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* #4-#10 List */}
        {leaderboard.length > 3 && (
          <div className="space-y-2">
            {leaderboard.slice(3).map((group, index) => {
              const isClickable = hasDeepDive(group.chatIdentifier)
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between bg-white/5 rounded-lg p-3 transition-colors ${
                    isClickable ? 'cursor-pointer hover:bg-white/10' : ''
                  } ${selectedChat === group.chatIdentifier ? 'ring-1 ring-white/30 bg-white/10' : ''}`}
                  onClick={() => isClickable && setSelectedChat(
                    selectedChat === group.chatIdentifier ? null : group.chatIdentifier
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-sm w-6">#{index + 4}</span>
                    <span className="text-lg">💬</span>
                    <div>
                      <span className="text-white">{group.chatName}</span>
                      <span className="text-white/40 text-sm ml-2">{group.memberCount} members</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 font-semibold">{formatNumber(group.totalMessages)}</span>
                    <span className="text-white/40 text-sm">You: {group.myPercentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Personality Profiles */}
      {Object.keys(personalities).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎭</span> Group Chat Personalities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaderboard.slice(0, 6).map((group) => {
              const p = personalities[group.chatIdentifier]
              if (!p) return null
              return (
                <div
                  key={group.chatIdentifier}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4"
                >
                  <p className="text-white font-semibold mb-3 truncate">{group.chatName}</p>
                  <div className="space-y-2">
                    {p.mostTalkative && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>📢</span>
                        <span className="text-white/60">Most Talkative:</span>
                        <span className="text-white font-medium truncate">{p.mostTalkative.name}</span>
                      </div>
                    )}
                    {p.lurker && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>👀</span>
                        <span className="text-white/60">Lurker:</span>
                        <span className="text-white font-medium truncate">{p.lurker.name}</span>
                      </div>
                    )}
                    {p.conversationStarter && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>🌅</span>
                        <span className="text-white/60">Starter:</span>
                        <span className="text-white font-medium truncate">{p.conversationStarter.name}</span>
                      </div>
                    )}
                    {p.lastWord && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>🌙</span>
                        <span className="text-white/60">Last Word:</span>
                        <span className="text-white font-medium truncate">{p.lastWord.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 text-sm">
                    <span className="text-white/40">You:</span>
                    <span className="text-white ml-1">#{p.you.rank}</span>
                    <span className="text-white/40 ml-2">({p.you.percentage}% of messages)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Deep Dive */}
      {selectedDeepDive && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🔍</span> Deep Dive: {selectedName}
            </h3>
            <button
              onClick={() => setSelectedChat(null)}
              className="text-white/40 hover:text-white text-sm bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Member Distribution */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Message Distribution</h4>
            <div className="h-[20rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedDeepDive.memberDistribution}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
                >
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="rgba(255,255,255,0.3)"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {selectedDeepDive.memberDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gc-gradient-${index % gradients.length})`}
                      />
                    ))}
                  </Bar>
                  <defs>
                    {gradients.map((colors, i) => (
                      <linearGradient key={i} id={`gc-gradient-${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Activity */}
          {selectedDeepDive.monthlyActivity.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Monthly Activity</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedDeepDive.monthlyActivity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gcAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <Tooltip content={<AreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#667eea"
                      fill="url(#gcAreaGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Emojis + Top Words */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedDeepDive.topEmojis.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Top Emojis</h4>
                <div className="grid grid-cols-5 gap-2">
                  {selectedDeepDive.topEmojis.map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-2 text-center hover:bg-white/10 transition-colors">
                      <span className="text-2xl">{item.emoji}</span>
                      <p className="text-white/40 text-xs mt-1">{item.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedDeepDive.topWords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Top Words</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDeepDive.topWords.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-white text-sm">{item.word}</span>
                      <span className="text-white/40 text-xs">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prompt to select a group */}
      {!selectedChat && Object.keys(deepDive).length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white/40 text-sm">Click a top group chat above to see the deep dive</p>
        </div>
      )}
    </div>
  )
}

export default GroupChats
