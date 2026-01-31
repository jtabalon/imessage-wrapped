import { useState, useEffect } from 'react'

const KEY_MAP = {
  '/api/health': 'health',
  '/api/stats': 'stats',
  '/api/contacts': 'contacts',
  '/api/activity': 'activity',
  '/api/response-times': 'responseTimes',
  '/api/emojis': 'emojis',
  '/api/words': 'words',
  '/api/sentiment': 'sentiment',
  '/api/streaks': 'streaks',
  '/api/group-chats': 'groupChats',
  '/api/stickers': 'stickers',
}

function getStaticData(endpoint) {
  if (typeof window !== 'undefined' && window.__IMESSAGE_WRAPPED_DATA__) {
    const key = KEY_MAP[endpoint]
    if (key && window.__IMESSAGE_WRAPPED_DATA__[key] !== undefined) {
      return window.__IMESSAGE_WRAPPED_DATA__[key]
    }
  }
  return null
}

export function isStaticMode() {
  return typeof window !== 'undefined' && !!window.__IMESSAGE_WRAPPED_DATA__
}

export function useApiData(endpoint) {
  const staticData = getStaticData(endpoint)
  const [data, setData] = useState(staticData)
  const [loading, setLoading] = useState(!staticData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (staticData) return

    let cancelled = false

    const fetchData = async () => {
      try {
        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err)
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [endpoint, staticData])

  return { data, loading, error }
}
