import { useMemo, useState } from 'react'
import ReactWordcloud from 'react-wordcloud'
import { useApiData } from '../hooks/useApiData'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const CHART_COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#f5576c']

const gradients = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
]

function formatNumber(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num?.toLocaleString() || '0'
}

function formatMonth(monthStr) {
  if (!monthStr) return ''
  const [y, m] = monthStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m, 10) - 1]} '${y.slice(2)}`
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur p-3 rounded-lg border border-white/10">
        <p className="text-white font-semibold text-sm">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatNumber(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function WordCloud() {
  const { data, loading, error } = useApiData('/api/words')
  const [selectedLengthContact, setSelectedLengthContact] = useState(null)

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

  if (error) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Your Vocabulary</h2>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400">Failed to load vocabulary data.</p>
          <p className="text-white/40 text-sm mt-1">Try refreshing the page. If the issue persists, check that the server is running.</p>
        </div>
      </div>
    )
  }

  const topWords = data?.wordCloud?.slice(0, 10) || []
  const { messageLength, textingStyle, catchphrases, vocabularyByContact, vocabularyEvolution } = data || {}

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

      {/* ===== SECTION 1: Message Length Stats ===== */}
      {messageLength && messageLength.totalMessages > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white mb-4">Message Length</h3>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">{messageLength.overallAvg}</p>
              <p className="text-white/60 text-sm">Avg Words / Message</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">{formatNumber(messageLength.totalMessages)}</p>
              <p className="text-white/60 text-sm">Total Messages</p>
            </div>
          </div>

          {/* Longest messages bar chart */}
          {messageLength.longestMessagesTo?.length > 0 && (() => {
            const selectedContact = selectedLengthContact
              ? messageLength.longestMessagesTo.find(c => c.contactId === selectedLengthContact)
              : null
            return (
              <div className="mb-6">
                <p className="text-white/60 text-sm mb-1">Longest messages to</p>
                <p className="text-white/40 text-xs mb-3">Click a bar to see messages</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={messageLength.longestMessagesTo}
                      layout="vertical"
                      margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        width={75}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgWords" name="Avg words" radius={[0, 4, 4, 0]} className="cursor-pointer">
                        {messageLength.longestMessagesTo.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={selectedLengthContact === entry.contactId
                              ? gradients[i % gradients.length][1]
                              : gradients[i % gradients.length][0]}
                            stroke={selectedLengthContact === entry.contactId ? '#fff' : 'none'}
                            strokeWidth={selectedLengthContact === entry.contactId ? 2 : 0}
                            className="cursor-pointer"
                            onClick={() => setSelectedLengthContact(
                              selectedLengthContact === entry.contactId ? null : entry.contactId
                            )}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Expanded detail panel */}
                {selectedContact && (
                  <div className="bg-white/5 rounded-lg p-4 mt-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-white font-semibold">{selectedContact.name}</p>
                      <button
                        onClick={() => setSelectedLengthContact(null)}
                        className="text-white/40 hover:text-white text-sm bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                    {selectedContact.topMessages?.length > 0 ? (
                      selectedContact.topMessages.map((msg, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3">
                          <div className="flex justify-between text-xs text-white/40 mb-1">
                            <span>{msg.wordCount} words</span>
                            {msg.date && <span>{msg.date}</span>}
                          </div>
                          <p className="text-white/80 text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/40 text-sm">No messages available</p>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Length distribution histogram */}
          {messageLength.lengthDistribution?.length > 0 && (
            <div>
              <p className="text-white/60 text-sm mb-3">Message length distribution</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={messageLength.lengthDistribution}>
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Messages" radius={[4, 4, 0, 0]}>
                      {messageLength.lengthDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== SECTION 2: Texting Style ===== */}
      {textingStyle && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white mb-4">Texting Style</h3>

          {/* Large centered score + label */}
          <div className="bg-white/5 rounded-xl p-6 text-center mb-6">
            <p className="text-5xl font-bold text-white mb-1">
              {textingStyle.formalityScore}
              <span className="text-2xl text-white/60">/100</span>
            </p>
            <p className="text-white/60 text-sm mb-2">Formality Score</p>
            <p className="text-xl font-semibold" style={{ color: '#f093fb' }}>
              {textingStyle.formalityScore >= 85 ? '\uD83E\uDDD0 ' : textingStyle.formalityScore >= 65 ? '\u2696\uFE0F ' : textingStyle.formalityScore >= 40 ? '\uD83C\uDFC4 ' : '\uD83D\uDD25 '}
              {textingStyle.label}
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{formatNumber(textingStyle.abbreviationsUsed)}</p>
              <p className="text-white/60 text-xs">Abbreviations</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{formatNumber(textingStyle.fullWordsUsed)}</p>
              <p className="text-white/60 text-xs">Full Words</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{formatNumber(textingStyle.allCapsMessages)}</p>
              <p className="text-white/60 text-xs">ALL CAPS Msgs</p>
            </div>
          </div>

          {/* Top abbreviations grid */}
          {textingStyle.topAbbreviations?.length > 0 && (
            <div>
              <p className="text-white/60 text-sm mb-3">Your top abbreviations</p>
              <div className="grid grid-cols-2 gap-2">
                {textingStyle.topAbbreviations.map((abbr, i) => (
                  <div key={i} className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between hover:bg-white/10 transition-colors">
                    <span className="text-white font-mono font-semibold">{abbr.word}</span>
                    <span className="text-purple-400 text-sm">{formatNumber(abbr.count)}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== SECTION 3: Catchphrases ===== */}
      {catchphrases && catchphrases.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white mb-1">Your Signature Words</h3>
          <p className="text-white/60 text-sm mb-4">Words you use way more than the average person</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {catchphrases.map((phrase, i) => (
              <div
                key={i}
                className="rounded-lg p-3 text-center hover:scale-105 transition-transform"
                style={{
                  background: i < 3
                    ? `linear-gradient(135deg, ${gradients[i][0]}22, ${gradients[i][1]}22)`
                    : 'rgba(255,255,255,0.05)',
                  border: i < 3 ? `1px solid ${gradients[i][0]}44` : '1px solid transparent'
                }}
              >
                <p className="text-white font-semibold text-lg">{phrase.word}</p>
                <p className="text-purple-400 text-sm">{formatNumber(phrase.count)}x</p>
                <p className="text-xs mt-1" style={{ color: i < 3 ? gradients[i][0] : 'rgba(255,255,255,0.5)' }}>
                  {phrase.overuseRatio}x more than typical
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SECTION 4: Vocabulary by Contact ===== */}
      {vocabularyByContact && vocabularyByContact.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white mb-1">Word Fingerprint by Contact</h3>
          <p className="text-white/60 text-sm mb-4">Distinctive words you use with each person</p>

          <div className="space-y-3">
            {vocabularyByContact.map((contact, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{contact.name}</span>
                  <span className="text-white/40 text-xs">{formatNumber(contact.totalWords)} words</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contact.distinctiveWords.map((dw, j) => (
                    <span
                      key={j}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${CHART_COLORS[j % CHART_COLORS.length]}22`,
                        color: CHART_COLORS[j % CHART_COLORS.length],
                        border: `1px solid ${CHART_COLORS[j % CHART_COLORS.length]}44`
                      }}
                    >
                      {dw.word} ({dw.count}x)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SECTION 5: Vocabulary Evolution ===== */}
      {vocabularyEvolution && vocabularyEvolution.trackedWords?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white mb-1">Vocabulary Evolution</h3>
          <p className="text-white/60 text-sm mb-4">How your top words changed over time</p>

          {/* Line chart: tracked words over months */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={vocabularyEvolution.trackedWords[0]?.monthlyCounts?.map((mc, idx) => {
                    const point = { month: formatMonth(mc.month) }
                    vocabularyEvolution.trackedWords.forEach((tw, twIdx) => {
                      point[tw.word] = tw.monthlyCounts[idx]?.count || 0
                    })
                    return point
                  }) || []}
                >
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  {vocabularyEvolution.trackedWords.map((tw, i) => (
                    <Line
                      key={tw.word}
                      type="monotone"
                      dataKey={tw.word}
                      name={tw.word}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-3 justify-center">
              {vocabularyEvolution.trackedWords.map((tw, i) => (
                <div key={tw.word} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-white/70 text-xs">{tw.word}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent months: trending / fading */}
          {(() => {
            const recentMonths = vocabularyEvolution.months
              ?.filter(m => m.trendingUp.length > 0 || m.fadingAway.length > 0)
              .slice(-6) || []
            if (recentMonths.length === 0) return null
            return (
              <div>
                <p className="text-white/60 text-sm mb-3">Recent word trends</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentMonths.map((m, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/70 text-xs font-semibold mb-2">{formatMonth(m.month)}</p>
                      {m.trendingUp.length > 0 && (
                        <div className="mb-1">
                          {m.trendingUp.map((w, j) => (
                            <span key={j} className="inline-block mr-2 mb-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30">
                              {w.word} ({w.count}x)
                            </span>
                          ))}
                        </div>
                      )}
                      {m.fadingAway.length > 0 && (
                        <div>
                          {m.fadingAway.map((w, j) => (
                            <span key={j} className="inline-block mr-2 mb-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                              {w.word} ({w.prevCount} &rarr; {w.count})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default WordCloud
