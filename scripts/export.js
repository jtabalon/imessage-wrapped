import { execSync, spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync, rmSync, cpSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const CLIENT_DIR = join(ROOT, 'client')
const EXPORT_DIR = join(ROOT, 'export')
const API_BASE = 'http://localhost:3001'

const ENDPOINTS = {
  health:        '/api/health',
  stats:         '/api/stats',
  contacts:      '/api/contacts',
  activity:      '/api/activity',
  responseTimes: '/api/response-times',
  emojis:        '/api/emojis',
  words:         '/api/words',
  sentiment:     '/api/sentiment',
  streaks:       '/api/streaks',
  groupChats:    '/api/group-chats',
  stickers:      '/api/stickers',
}

function log(msg) {
  console.log(msg)
}

function getDirSize(dir) {
  let total = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      total += getDirSize(fullPath)
    } else {
      total += statSync(fullPath).size
    }
  }
  return total
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      const body = await res.json()
      if (body.status === 'ok') return
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error('Server did not start in time. Check that Full Disk Access is granted.')
}

async function main() {
  log('\n  iMessage Wrapped — Export\n')

  // Step 1: Start backend
  log('  [1/7] Starting backend server...')
  const server = spawn('node', ['server/index.js'], {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env },
  })

  let serverError = ''
  server.stderr.on('data', (chunk) => { serverError += chunk.toString() })

  try {
    await waitForServer(API_BASE + '/api/health', 30000)
    log('        Server is ready.')
  } catch (err) {
    server.kill()
    console.error('\n  ERROR: Could not start backend server.')
    if (serverError) console.error('  ' + serverError.trim())
    console.error('  ' + err.message)
    process.exit(1)
  }

  // Step 2: Fetch all API data
  log('  [2/7] Fetching all API data...')
  const data = {}
  for (const [key, endpoint] of Object.entries(ENDPOINTS)) {
    try {
      const res = await fetch(API_BASE + endpoint)
      data[key] = await res.json()
      log(`        ${key}`)
    } catch (err) {
      log(`        ${key} — SKIPPED (${err.message})`)
      data[key] = null
    }
  }

  // Step 3: Encode sticker images as base64
  log('  [3/7] Encoding sticker images...')
  data.stickerImages = {}
  const stickerData = data.stickers
  if (stickerData) {
    const allFilenames = new Set()

    for (const list of [
      stickerData.topStickersOverall,
      stickerData.topStickersSent,
      stickerData.topStickersReceived,
    ]) {
      (list || []).forEach(s => { if (s.filename) allFilenames.add(s.filename) })
    }
    for (const list of [stickerData.topStickerSentTo, stickerData.topStickerReceivedFrom]) {
      (list || []).forEach(s => {
        if (s.favoriteSticker?.filename) allFilenames.add(s.favoriteSticker.filename)
      })
    }

    let encoded = 0
    let failed = 0
    for (const filename of allFilenames) {
      try {
        const res = await fetch(
          API_BASE + `/api/sticker-image?path=${encodeURIComponent(filename)}`
        )
        if (res.ok) {
          const buffer = await res.arrayBuffer()
          const contentType = res.headers.get('content-type') || 'image/jpeg'
          const base64 = Buffer.from(buffer).toString('base64')
          data.stickerImages[filename] = `data:${contentType};base64,${base64}`
          encoded++
        } else {
          failed++
        }
      } catch {
        failed++
      }
    }
    log(`        ${encoded} encoded, ${failed} failed`)
  } else {
    log('        No sticker data found.')
  }

  // Step 4: Kill backend
  log('  [4/7] Stopping backend server...')
  server.kill('SIGTERM')
  // Give it a moment to shut down cleanly
  await new Promise(r => setTimeout(r, 500))

  // Step 5: Build frontend
  log('  [5/7] Building frontend...')
  try {
    execSync('npm run build', { cwd: CLIENT_DIR, stdio: 'pipe' })
    log('        Build complete.')
  } catch (err) {
    console.error('\n  ERROR: Frontend build failed.')
    console.error(err.stdout?.toString() || err.message)
    process.exit(1)
  }

  // Step 6: Inject data into HTML
  log('  [6/7] Injecting data into HTML...')
  const htmlPath = join(CLIENT_DIR, 'dist', 'index.html')
  let html = readFileSync(htmlPath, 'utf-8')

  // Safely encode JSON — prevent </script> from breaking out of the script tag
  const safeJson = JSON.stringify(data).replace(/<\/script/gi, '<\\/script')
  const dataScript = `<script>window.__IMESSAGE_WRAPPED_DATA__=${safeJson};</script>`
  html = html.replace('</head>', `${dataScript}\n</head>`)
  writeFileSync(htmlPath, html)

  // Step 7: Copy to export directory
  log('  [7/7] Copying to export directory...')
  if (existsSync(EXPORT_DIR)) {
    rmSync(EXPORT_DIR, { recursive: true })
  }
  cpSync(join(CLIENT_DIR, 'dist'), EXPORT_DIR, { recursive: true })

  const totalSize = getDirSize(EXPORT_DIR)
  const sizeMB = (totalSize / 1024 / 1024).toFixed(1)

  log(`
  Export complete!
  Output: ./export/
  Size:   ${sizeMB} MB

  Preview locally:
    npx serve export

  Deploy to Vercel:
    cd export && npx vercel

  Deploy to Netlify:
    cd export && npx netlify deploy --prod --dir .
`)
}

main().catch(err => {
  console.error('\n  Unexpected error:', err.message)
  process.exit(1)
})
