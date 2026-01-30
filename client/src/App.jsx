import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'

function App() {
  const [isConnected, setIsConnected] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      if (data.status === 'ok') {
        setIsConnected(true)
      } else {
        setError(data.error)
        setIsConnected(false)
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure the backend is running.')
      setIsConnected(false)
    }
  }

  if (isConnected === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <h1 className="text-2xl font-bold text-white mb-2">Loading iMessage Wrapped...</h1>
          <p className="text-white/60">Connecting to your messages</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-lg text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">Connection Error</h1>
          <p className="text-white/80 mb-6 whitespace-pre-wrap">{error}</p>
          <div className="bg-white/5 rounded-lg p-4 text-left text-sm text-white/60">
            <p className="font-semibold text-white/80 mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Open System Preferences {">"} Security & Privacy</li>
              <li>Go to Privacy {">"} Full Disk Access</li>
              <li>Add Terminal (or your terminal app)</li>
              <li>Restart the server</li>
            </ol>
          </div>
          <button
            onClick={checkConnection}
            className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard />
}

export default App
