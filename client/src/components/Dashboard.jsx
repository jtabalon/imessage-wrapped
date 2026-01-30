import { useState, useEffect } from 'react'
import TopContacts from './TopContacts'
import ActivityChart from './ActivityChart'
import EmojiStats from './EmojiStats'
import ResponseTimes from './ResponseTimes'
import WordCloud from './WordCloud'
import SentimentAnalysis from './SentimentAnalysis'
import StickerStats from './StickerStats'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const formatMonth = (monthStr) => {
    if (!monthStr) return 'N/A'
    const [year, month] = monthStr.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4">
            iMessage Wrapped
          </h1>
          <p className="text-xl text-white/60">Your iMessage history in review</p>
        </header>

        {/* Overall Stats */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-white mb-6">The Big Picture</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card gradient-1 h-32 loading-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card gradient-1">
                <p className="text-white/80 text-sm uppercase tracking-wide">Total Messages</p>
                <p className="text-4xl font-bold text-white mt-2">{formatNumber(stats?.totalMessages)}</p>
              </div>
              <div className="stat-card gradient-2">
                <p className="text-white/80 text-sm uppercase tracking-wide">Sent</p>
                <p className="text-4xl font-bold text-white mt-2">{formatNumber(stats?.sent)}</p>
              </div>
              <div className="stat-card gradient-3">
                <p className="text-white/80 text-sm uppercase tracking-wide">Received</p>
                <p className="text-4xl font-bold text-white mt-2">{formatNumber(stats?.received)}</p>
              </div>
              <div className="stat-card gradient-4">
                <p className="text-white/80 text-sm uppercase tracking-wide">Conversations</p>
                <p className="text-4xl font-bold text-white mt-2">{formatNumber(stats?.uniqueConversations)}</p>
              </div>
            </div>
          )}
        </section>

        {/* Highlight Stats */}
        {stats && (
          <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-white/60 text-sm">Most Active Month</p>
                <p className="text-2xl font-bold text-white">{formatMonth(stats.mostActiveMonth?.month)}</p>
                <p className="text-lg text-purple-400">{formatNumber(stats.mostActiveMonth?.count)} messages</p>
              </div>
              <div className="card">
                <p className="text-white/60 text-sm">Busiest Day Ever</p>
                <p className="text-2xl font-bold text-white">{formatDate(stats.busiestDay?.date)}</p>
                <p className="text-lg text-pink-400">{formatNumber(stats.busiestDay?.count)} messages</p>
              </div>
              <div className="card">
                <p className="text-white/60 text-sm">Daily Average</p>
                <p className="text-2xl font-bold text-white">{stats.averagePerDay} messages</p>
                <p className="text-lg text-cyan-400">per day</p>
              </div>
            </div>
          </section>
        )}

        {/* Top Contacts */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <TopContacts />
        </section>

        {/* Activity Chart */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <ActivityChart />
        </section>

        {/* Response Times */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <ResponseTimes />
        </section>

        {/* Emoji Stats */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <EmojiStats />
        </section>

        {/* Word Cloud */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <WordCloud />
        </section>

        {/* Sticker Stats */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <StickerStats />
        </section>

        {/* Sentiment Analysis */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <SentimentAnalysis />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-white/40">
          <p>iMessage Wrapped</p>
          <p className="text-sm mt-2">Your messages, your memories</p>
        </footer>
      </div>
    </div>
  )
}

export default Dashboard
