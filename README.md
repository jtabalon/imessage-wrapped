# iMessage Wrapped 2025

A "Spotify Wrapped" style application that analyzes your iMessage history from 2025 and presents beautiful insights through an interactive web dashboard.

## Features

- **Overall Stats**: Total messages sent/received, conversations, most active periods
- **Top Contacts**: Your top 10 people with messaging personality insights
- **Activity Patterns**: Heatmaps showing when you message most (hourly, daily, monthly)
- **Response Times**: See who you reply to fastest and who replies to you quickest
- **Emoji Stats**: Your most used emojis with trends over time
- **Sticker Stats**: Your most sent stickers
- **Word Cloud**: Visual representation of your most common words
- **Sentiment Analysis**: Mood trends and emotional tone of your conversations
- **Streaks**: Your longest messaging streaks
- **Group Chats**: Analytics across your group conversations
- **Story Export**: Export your stats as Instagram story-style images

## Prerequisites

- macOS (iMessage database is macOS-only)
- [Node.js](https://nodejs.org/) 18 or later
- Full Disk Access granted to your terminal app (see below)

### Granting Full Disk Access

1. Open **System Settings** > **Privacy & Security** > **Full Disk Access**
2. Toggle on your terminal app (Terminal, iTerm2, Warp, etc.)
3. Restart your terminal

## Quick Start

The easiest way to get running is the included setup script. It checks prerequisites, installs dependencies, and starts the app:

```bash
git clone <repo-url> imessage-wrapped
cd imessage-wrapped
./run.sh
```

The app will open automatically at **http://localhost:5173**.

## Manual Setup

If you prefer to install step by step:

```bash
git clone <repo-url> imessage-wrapped
cd imessage-wrapped

# Install backend and frontend dependencies
npm run install:all

# Start the app (backend + frontend)
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Running Backend and Frontend Separately

```bash
# Terminal 1: Start the backend (port 3001)
npm run server

# Terminal 2: Start the frontend (port 5173)
npm run client
```

## Tech Stack

- **Backend**: Node.js, Express, better-sqlite3
- **Frontend**: React, Vite, Tailwind CSS
- **Charts**: Recharts
- **Word Cloud**: react-wordcloud
- **Export**: html2canvas, JSZip

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Test database connection |
| `GET /api/stats` | Overall statistics |
| `GET /api/contacts` | Top contacts analysis |
| `GET /api/activity` | Activity patterns |
| `GET /api/response-times` | Response time analysis |
| `GET /api/emojis` | Emoji statistics |
| `GET /api/words` | Word frequency for cloud |
| `GET /api/sentiment` | Sentiment analysis |
| `GET /api/streaks` | Streak statistics |
| `GET /api/group-chats` | Group chat analytics |
| `GET /api/stickers` | Sticker statistics |

## Privacy

- All data is processed locally on your machine
- No data is sent to external servers
- Phone numbers and emails are partially masked in the UI

## Troubleshooting

### "Cannot access iMessage database"

Make sure you've granted Full Disk Access to your terminal app and restarted it.

### No messages showing up

The app filters for messages from 2025. If you have few 2025 messages, you may see limited data.

### Dependency install fails with peer conflict

Run `npm run install:all` from the project root — this handles known peer dependency conflicts automatically. If you're installing in `client/` directly, the included `.npmrc` should resolve it. If not, run:

```bash
cd client
npm install --legacy-peer-deps
```
