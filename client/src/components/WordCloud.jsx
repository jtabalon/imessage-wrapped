import { useState, useEffect, useMemo } from 'react'
import ReactWordcloud from 'react-wordcloud'

function WordCloud() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    try {
      const res = await fetch('/api/words')
      const data = await res.json()
      setData(data)
    } catch (err) {
      console.error('Error fetching words:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toLocaleString() || '0'
  }

  const wordCloudOptions = useMemo(() => ({
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'],
    enableTooltip: true,
    deterministic: true,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSizes: [16, 80],
    fontStyle: 'normal',
    fontWeight: 'bold',
    padding: 2,
    rotations: 2,
    rotationAngles: [0, 0],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 500,
  }), [])

  const callbacks = useMemo(() => ({
    getWordTooltip: word => `"${word.text}" - used ${formatNumber(word.value)} times`,
  }), [])

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Your Vocabulary</h2>
        <div className="h-96 loading-shimmer rounded-lg" />
      </div>
    )
  }

  const topWords = data?.wordCloud?.slice(0, 10) || []

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-2">Your Vocabulary</h2>
      <p className="text-white/60 mb-6">Words you used most</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(data?.totalWords)}</p>
          <p className="text-white/60 text-sm">Total Words Sent</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(data?.uniqueWords)}</p>
          <p className="text-white/60 text-sm">Unique Words</p>
        </div>
      </div>

      {/* Word Cloud */}
      <div className="bg-white/5 rounded-xl p-4 mb-8" style={{ height: '400px' }}>
        {data?.wordCloud && data.wordCloud.length > 0 ? (
          <ReactWordcloud
            words={data.wordCloud}
            options={wordCloudOptions}
            callbacks={callbacks}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-white/40">
            Not enough word data to generate cloud
          </div>
        )}
      </div>

      {/* Top 10 Words List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 Words</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {topWords.map((word, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-3 text-center hover:bg-white/10 transition-colors"
            >
              <span className="text-xs text-white/40">#{index + 1}</span>
              <p className="text-white font-semibold truncate" title={word.text}>
                {word.text}
              </p>
              <p className="text-purple-400 text-sm">{formatNumber(word.value)}x</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fun insights */}
      {data?.totalWords && data?.uniqueWords && (
        <div className="mt-6 bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white/60">
            Your vocabulary diversity score: <span className="text-purple-400 font-semibold">
              {((data.uniqueWords / data.totalWords) * 100).toFixed(1)}%
            </span>
            {data.uniqueWords / data.totalWords > 0.1
              ? ' - You use a rich variety of words!'
              : ' - You like to stick to familiar words!'}
          </p>
        </div>
      )}
    </div>
  )
}

export default WordCloud
