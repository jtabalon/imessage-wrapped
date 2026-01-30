import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

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

function TopContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      setContacts(data)
    } catch (err) {
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-white font-semibold">{data.name || data.id || 'Unknown'}</p>
          <p className="text-green-400">Sent: {formatNumber(data.sent)}</p>
          <p className="text-blue-400">Received: {formatNumber(data.received)}</p>
          <p className="text-purple-400 text-sm mt-1">Style: {data.personality}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Your Top People</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Your Top People</h2>
      <p className="text-white/60 mb-6">Who you talked to most</p>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {contacts.slice(0, 3).map((contact, index) => {
          const heights = ['h-32', 'h-24', 'h-20']
          const positions = [1, 0, 2] // Reorder for podium effect
          const actualIndex = positions[index]
          const podiumContact = contacts[actualIndex]
          if (!podiumContact) return null

          return (
            <div key={actualIndex} className="flex flex-col items-center">
              <div
                className={`text-4xl mb-2 ${actualIndex === 0 ? 'animate-pulse-slow' : ''}`}
              >
                {actualIndex === 0 ? '🥇' : actualIndex === 1 ? '🥈' : '🥉'}
              </div>
              <div
                className={`w-24 ${heights[actualIndex]} rounded-t-lg flex flex-col items-center justify-center px-2`}
                style={{
                  background: `linear-gradient(135deg, ${gradients[actualIndex][0]}, ${gradients[actualIndex][1]})`
                }}
              >
                <p className="text-white font-bold text-lg">{formatNumber(podiumContact.total)}</p>
                <p className="text-white/80 text-xs text-center truncate w-full">
                  {podiumContact.name || podiumContact.id || 'Unknown'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="h-[28rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={contacts}
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
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {contacts.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${index % gradients.length})`}
                />
              ))}
            </Bar>
            <defs>
              {gradients.map((colors, i) => (
                <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors[0]} />
                  <stop offset="100%" stopColor={colors[1]} />
                </linearGradient>
              ))}
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Messaging Personality */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-3xl mb-1">🚀</p>
          <p className="text-white font-semibold">Initiators</p>
          <p className="text-white/60 text-sm">
            {contacts.filter(c => c.personality === 'Initiator').length} contacts
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-3xl mb-1">⚖️</p>
          <p className="text-white font-semibold">Balanced</p>
          <p className="text-white/60 text-sm">
            {contacts.filter(c => c.personality === 'Balanced').length} contacts
          </p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-3xl mb-1">💬</p>
          <p className="text-white font-semibold">Responders</p>
          <p className="text-white/60 text-sm">
            {contacts.filter(c => c.personality === 'Responder').length} contacts
          </p>
        </div>
      </div>
    </div>
  )
}

export default TopContacts
