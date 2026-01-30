import express from 'express';
import cors from 'cors';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { homedir, tmpdir } from 'os';
import { resolve, normalize, extname, join, basename } from 'path';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { testConnection } from './db.js';
import {
  getOverallStats,
  getTopContacts,
  getActivityPatterns,
  getResponseTimes,
  getEmojiStats,
  getWordFrequency,
  getSentimentAnalysis,
  getStickerStats,
  getStreakStats,
  getGroupChatStats
} from './analytics.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check and database test
app.get('/api/health', (req, res) => {
  const result = testConnection();
  if (result.success) {
    res.json({
      status: 'ok',
      database: 'connected',
      totalMessages: result.messageCount
    });
  } else {
    res.status(500).json({
      status: 'error',
      error: result.error
    });
  }
});

// Overall statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = getOverallStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top contacts
app.get('/api/contacts', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const contacts = getTopContacts(limit);
    res.json(contacts);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Activity patterns
app.get('/api/activity', (req, res) => {
  try {
    const activity = getActivityPatterns();
    res.json(activity);
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Response times
app.get('/api/response-times', (req, res) => {
  try {
    const responseTimes = getResponseTimes();
    res.json(responseTimes);
  } catch (error) {
    console.error('Error getting response times:', error);
    res.status(500).json({ error: error.message });
  }
});

// Emoji statistics
app.get('/api/emojis', (req, res) => {
  try {
    const emojis = getEmojiStats();
    res.json(emojis);
  } catch (error) {
    console.error('Error getting emojis:', error);
    res.status(500).json({ error: error.message });
  }
});

// Word frequency for word cloud
app.get('/api/words', (req, res) => {
  try {
    const words = getWordFrequency();
    res.json(words);
  } catch (error) {
    console.error('Error getting words:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sentiment analysis
app.get('/api/sentiment', (req, res) => {
  try {
    const sentiment = getSentimentAnalysis();
    res.json(sentiment);
  } catch (error) {
    console.error('Error getting sentiment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Streak statistics
app.get('/api/streaks', (req, res) => {
  try {
    const streaks = getStreakStats();
    res.json(streaks);
  } catch (error) {
    console.error('Error getting streaks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Group chat analytics
app.get('/api/group-chats', (req, res) => {
  try {
    const groupChats = getGroupChatStats();
    res.json(groupChats);
  } catch (error) {
    console.error('Error getting group chats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sticker analytics
app.get('/api/stickers', (req, res) => {
  try {
    const stickers = getStickerStats();
    res.json(stickers);
  } catch (error) {
    console.error('Error getting stickers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cache directory for converted HEIC sticker images
const STICKER_CACHE_DIR = join(tmpdir(), 'imessage-wrapped-sticker-cache');
mkdirSync(STICKER_CACHE_DIR, { recursive: true });

// Serve sticker image files from disk, converting HEIC/HEIF to JPEG via macOS sips
app.get('/api/sticker-image', (req, res) => {
  try {
    const encodedPath = req.query.path;
    if (!encodedPath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // Expand ~ to home directory
    const expandedPath = encodedPath.startsWith('~')
      ? encodedPath.replace('~', homedir())
      : encodedPath;

    // Resolve to absolute path and normalize to prevent traversal
    const absolutePath = resolve(normalize(expandedPath));
    const allowedPrefix = resolve(homedir(), 'Library', 'Messages');

    if (!absolutePath.startsWith(allowedPrefix)) {
      return res.status(403).json({ error: 'Access denied: path outside allowed directory' });
    }

    if (!existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Sticker file not found' });
    }

    const ext = extname(absolutePath).toLowerCase();
    const needsConversion = ['.heic', '.heif'].includes(ext);

    if (needsConversion) {
      // Use a hash of the path as cache key
      const hash = createHash('md5').update(absolutePath).digest('hex');
      const cachedPath = join(STICKER_CACHE_DIR, hash + '.jpeg');

      if (!existsSync(cachedPath)) {
        // Convert using macOS built-in sips (supports HEIC natively)
        execFileSync('sips', ['-s', 'format', 'jpeg', absolutePath, '--out', cachedPath], {
          timeout: 10000
        });
      }

      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      res.sendFile(cachedPath);
    } else {
      res.set('Cache-Control', 'public, max-age=86400');
      res.sendFile(absolutePath);
    }
  } catch (error) {
    console.error('Error serving sticker image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🍎 iMessage Wrapped server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   GET /api/health - Test database connection`);
  console.log(`   GET /api/stats - Overall statistics`);
  console.log(`   GET /api/contacts - Top contacts`);
  console.log(`   GET /api/activity - Activity patterns`);
  console.log(`   GET /api/response-times - Response time analysis`);
  console.log(`   GET /api/emojis - Emoji statistics`);
  console.log(`   GET /api/words - Word frequency`);
  console.log(`   GET /api/sentiment - Sentiment analysis`);
  console.log(`   GET /api/streaks - Streak statistics`);
  console.log(`   GET /api/group-chats - Group chat analytics`);
  console.log(`   GET /api/stickers - Sticker statistics`);
  console.log(`   GET /api/sticker-image - Serve sticker images`);
});
