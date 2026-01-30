# iMessage Wrapped 2025

A "Spotify Wrapped" style application that analyzes your iMessage history from 2025 and presents beautiful insights through an interactive web dashboard.

## Features

- **Overall Stats**: Total messages sent/received, conversations, most active periods
- **Top Contacts**: Your top 10 people with messaging personality insights
- **Activity Patterns**: Heatmaps showing when you message most (hourly, daily, monthly)
- **Response Times**: See who you reply to fastest and who replies to you quickest
- **Emoji Stats**: Your most used emojis with trends over time
- **Word Cloud**: Visual representation of your most common words
- **Sentiment Analysis**: Mood trends and emotional tone of your conversations

## Prerequisites

- macOS (iMessage database is macOS-only)
- Node.js 18+
- Full Disk Access granted to Terminal

### Granting Full Disk Access

1. Open **System Preferences** > **Security & Privacy**
2. Go to **Privacy** > **Full Disk Access**
3. Click the lock to make changes
4. Add **Terminal** (or your terminal app like iTerm2)
5. Restart your terminal

## Installation

```bash
# Navigate to the project directory
cd imessage-wrapped

# Install all dependencies
npm run install:all
```

## Usage

### Development Mode

Run both the backend and frontend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1: Start the backend
npm run server

# Terminal 2: Start the frontend
npm run client
```

### Accessing the App

1. Open your browser to **http://localhost:5173**
2. The app will connect to your iMessage database and generate insights
3. Explore your 2025 messaging year!

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Vite
- **Database**: SQLite (reading macOS iMessage chat.db)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Word Cloud**: react-wordcloud

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

## Privacy

- All data is processed locally on your machine
- No data is sent to external servers
- Phone numbers and emails are partially masked in the UI

## Troubleshooting

### "Cannot access iMessage database"
Make sure you've granted Full Disk Access to your terminal application.

### No messages showing up
The app filters for messages from 2025. If you're viewing before 2025 or have few 2025 messages, you may see limited data.

### Charts not rendering
Try refreshing the page. If the issue persists, check the browser console for errors.
