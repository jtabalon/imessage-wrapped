import express from 'express';
import cors from 'cors';
import { testConnection } from './db.js';
import {
  getOverallStats,
  getTopContacts,
  getActivityPatterns,
  getResponseTimes,
  getEmojiStats,
  getWordFrequency,
  getSentimentAnalysis
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
});
