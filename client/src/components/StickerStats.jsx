import { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, Legend,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

function StickerStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStickers()
  }, [])

  const fetchStickers = async () => {
    try {
      const res = await fetch('/api/stickers')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Error fetching stickers:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const stickerImageUrl = (filename) => {
    if (!filename) return null
    return `/api/sticker-image?path=${encodeURIComponent(filename)}`
  }

  const StickerImage = ({ filename, transfer_name, size = 64 }) => {
    const [errored, setErrored] = useState(false)
    const [popover, setPopover] = useState(null)
    const imgRef = useRef(null)
    const url = stickerImageUrl(filename)

    useEffect(() => {
      if (!popover) return
      const dismiss = () => setPopover(null)
      const handleEsc = (e) => { if (e.key === 'Escape') dismiss() }
      document.addEventListener('mousedown', dismiss)
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.removeEventListener('mousedown', dismiss)
        document.removeEventListener('keydown', handleEsc)
      }
    }, [popover])

    const handleClick = (e) => {
      e.stopPropagation()
      if (popover) {
        setPopover(null)
        return
      }
      const rect = imgRef.current.getBoundingClientRect()
      const popSize = 208 // 192 image + 16 padding
      let left = rect.left + rect.width / 2 - popSize / 2
      left = Math.max(8, Math.min(left, window.innerWidth - popSize - 8))
      let top = rect.top - popSize - 8
      if (top < 8) top = rect.bottom + 8
      setPopover({ top, left })
    }

    if (!url || errored) {
      return (
        <div
          className="bg-white/10 rounded-lg flex flex-col items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span style={{ fontSize: size * 0.5 }}>🩷</span>
        </div>
      )
    }

    return (
      <>
        <img
          ref={imgRef}
          src={url}
          alt={transfer_name || 'sticker'}
          style={{ width: size, height: size, objectFit: 'contain' }}
          className="rounded-lg cursor-pointer"
          onClick={handleClick}
          onError={() => setErrored(true)}
        />
        {popover && (
          <div
            className="fixed bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 p-2 shadow-xl z-50"
            style={{ top: popover.top, left: popover.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <img
              src={url}
              alt={transfer_name || 'sticker'}
              style={{ width: 192, height: 192, objectFit: 'contain' }}
              className="rounded-lg"
            />
          </div>
        )}
      </>
    )
  }

  const TrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{formatNumber(p.value)} {p.name}</p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Sticker Stats</h2>
        <div className="h-64 loading-shimmer rounded-lg" />
      </div>
    )
  }

  if (!data || data.totalStickers === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-2">Sticker Stats</h2>
        <p className="text-white/60">No stickers found in your messages.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Sticker Stats</h2>
      <p className="text-white/60 mb-6">Your sticker game, by the numbers</p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(data.totalStickers)}</p>
          <p className="text-white/60 text-sm">Total Stickers</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(data.sent)}</p>
          <p className="text-white/60 text-sm">Sent</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(data.received)}</p>
          <p className="text-white/60 text-sm">Received</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(data.uniqueStickers)}</p>
          <p className="text-white/60 text-sm">Unique Stickers</p>
        </div>
      </div>

      {/* Top Stickers Overall Grid */}
      {data.topStickersOverall?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Top Stickers</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {data.topStickersOverall.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors relative group"
                title={item.topContact ? `Top contact: ${item.topContact}` : undefined}
              >
                <StickerImage filename={item.filename} transfer_name={item.transfer_name} size={48} />
                <span className="text-xs text-white/40">{formatNumber(item.count)}</span>
                {item.topContact && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {item.topContact}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent vs Received */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top Sent */}
        {data.topStickersSent?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Sent</h3>
            <div className="grid grid-cols-5 gap-3">
              {data.topStickersSent.slice(0, 5).map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors relative group">
                  <span className="text-white/30 text-xs">#{index + 1}</span>
                  <StickerImage filename={item.filename} transfer_name={item.transfer_name} size={48} />
                  <span className="text-purple-400 font-semibold text-sm">{formatNumber(item.count)}</span>
                  {item.topContact && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {item.topContact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Received */}
        {data.topStickersReceived?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Received</h3>
            <div className="grid grid-cols-5 gap-3">
              {data.topStickersReceived.slice(0, 5).map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors relative group">
                  <span className="text-white/30 text-xs">#{index + 1}</span>
                  <StickerImage filename={item.filename} transfer_name={item.transfer_name} size={48} />
                  <span className="text-pink-400 font-semibold text-sm">{formatNumber(item.count)}</span>
                  {item.topContact && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {item.topContact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Trend — Sent vs Received */}
      {data.monthlyTrend?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Sticker Usage Over Time</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  tickFormatter={(v) => {
                    const [year, month] = v.split('-')
                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                  }}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip content={<TrendTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
                <Line
                  type="monotone"
                  dataKey="sent"
                  name="Sent"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={{ fill: '#c084fc', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="received"
                  name="Received"
                  stroke="#f472b6"
                  strokeWidth={2}
                  dot={{ fill: '#f472b6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-Contact Favorite Sticker — Sent To / Received From */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.topStickerSentTo?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Most Sent Sticker Per Contact</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {data.topStickerSentTo.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                  <StickerImage
                    filename={item.favoriteSticker?.filename}
                    transfer_name={item.favoriteSticker?.transfer_name}
                    size={48}
                  />
                  <p className="text-white text-sm font-medium truncate w-full text-center">{item.name}</p>
                  <span className="text-purple-400 font-semibold text-xs">{formatNumber(item.favoriteSticker?.count)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.topStickerReceivedFrom?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Most Received Sticker Per Contact</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {data.topStickerReceivedFrom.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                  <StickerImage
                    filename={item.favoriteSticker?.filename}
                    transfer_name={item.favoriteSticker?.transfer_name}
                    size={48}
                  />
                  <p className="text-white text-sm font-medium truncate w-full text-center">{item.name}</p>
                  <span className="text-pink-400 font-semibold text-xs">{formatNumber(item.favoriteSticker?.count)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StickerStats
