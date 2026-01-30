import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useApiData } from '../hooks/useApiData'
import TitleStoryCard from './stories/TitleStoryCard'
import TopContactsStoryCard from './stories/TopContactsStoryCard'
import ActivityStoryCard from './stories/ActivityStoryCard'
import EmojiStoryCard from './stories/EmojiStoryCard'
import StreaksStoryCard from './stories/StreaksStoryCard'
import GroupChatsStoryCard from './stories/GroupChatsStoryCard'

function StoryExport() {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState('')
  const containerRef = useRef(null)

  const { data: stats } = useApiData('/api/stats')
  const { data: contacts } = useApiData('/api/contacts')
  const { data: activity } = useApiData('/api/activity')
  const { data: emojis } = useApiData('/api/emojis')
  const { data: streaks } = useApiData('/api/streaks')
  const { data: groupChats } = useApiData('/api/group-chats')

  const cards = [
    { id: 'title', name: '01-title', component: <TitleStoryCard stats={stats} /> },
    { id: 'contacts', name: '02-top-contacts', component: <TopContactsStoryCard contacts={contacts} /> },
    { id: 'activity', name: '03-activity', component: <ActivityStoryCard activity={activity} /> },
    { id: 'emojis', name: '04-emojis', component: <EmojiStoryCard emojis={emojis} /> },
    { id: 'streaks', name: '05-streaks', component: <StreaksStoryCard streaks={streaks} /> },
    { id: 'groups', name: '06-group-chats', component: <GroupChatsStoryCard groupChats={groupChats} /> },
  ]

  const handleExport = async () => {
    setExporting(true)
    const zip = new JSZip()

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      setProgress(`Rendering ${card.name}... (${i + 1}/${cards.length})`)

      const el = document.getElementById(`story-card-${card.id}`)
      if (!el || !el.firstChild) continue

      try {
        const canvas = await html2canvas(el, {
          scale: 1,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          width: 1080,
          height: 1920,
        })

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        if (blob) {
          zip.file(`${card.name}.png`, blob)
        }
      } catch (err) {
        console.error(`Failed to render ${card.name}:`, err)
      }
    }

    setProgress('Creating ZIP...')
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, 'imessage-wrapped-stories.zip')
    } catch (err) {
      console.error('Failed to create ZIP:', err)
    }

    setExporting(false)
    setProgress('')
  }

  return (
    <>
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
          exporting
            ? 'bg-white/10 text-white/40 cursor-wait'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/25'
        }`}
      >
        {exporting ? progress : 'Download Story Images'}
      </button>

      {/* Off-screen rendering area — must be in the DOM but not visible */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          pointerEvents: 'none',
        }}
      >
        {cards.map(card => (
          <div key={card.id} id={`story-card-${card.id}`}>
            {card.component}
          </div>
        ))}
      </div>
    </>
  )
}

export default StoryExport
