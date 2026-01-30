import { getMessages2025, appleTimestampToDate, getHandles, getDatabase, getContactName } from './db.js';

// Cache for processed data
let messagesCache = null;

function getProcessedMessages() {
  if (messagesCache) return messagesCache;

  const rawMessages = getMessages2025();
  messagesCache = rawMessages.map(msg => ({
    ...msg,
    date: appleTimestampToDate(msg.date),
    text: msg.text || ''
  }));

  return messagesCache;
}

// Clear cache (useful if data needs refreshing)
export function clearCache() {
  messagesCache = null;
}

// Overall statistics
export function getOverallStats() {
  const messages = getProcessedMessages();

  const sent = messages.filter(m => m.is_from_me).length;
  const received = messages.filter(m => !m.is_from_me).length;

  // Unique conversations (by contact_id or chat_identifier)
  const uniqueConversations = new Set(
    messages.map(m => m.chat_identifier || m.contact_id)
  ).size;

  // Monthly breakdown
  const monthlyCount = {};
  const dailyCount = {};

  messages.forEach(msg => {
    if (!msg.date) return;
    const monthKey = `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = msg.date.toISOString().split('T')[0];

    monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    dailyCount[dayKey] = (dailyCount[dayKey] || 0) + 1;
  });

  // Most active month
  const mostActiveMonth = Object.entries(monthlyCount)
    .sort((a, b) => b[1] - a[1])[0];

  // Busiest day
  const busiestDay = Object.entries(dailyCount)
    .sort((a, b) => b[1] - a[1])[0];

  // Calculate actual date range for daily average
  const messagesWithDates = messages.filter(m => m.date);
  const firstMessage = messagesWithDates.length > 0 ? messagesWithDates[0].date : null;
  const lastMessage = messagesWithDates.length > 0 ? messagesWithDates[messagesWithDates.length - 1].date : null;
  const daySpan = firstMessage && lastMessage
    ? Math.max(1, Math.ceil((lastMessage - firstMessage) / (1000 * 60 * 60 * 24)))
    : 1;

  return {
    totalMessages: messages.length,
    sent,
    received,
    uniqueConversations,
    mostActiveMonth: mostActiveMonth ? { month: mostActiveMonth[0], count: mostActiveMonth[1] } : null,
    busiestDay: busiestDay ? { date: busiestDay[0], count: busiestDay[1] } : null,
    averagePerDay: Math.round(messages.length / daySpan),
    dateRange: firstMessage && lastMessage ? {
      start: firstMessage.toISOString().split('T')[0],
      end: lastMessage.toISOString().split('T')[0],
      days: daySpan
    } : null
  };
}

// Top contacts analysis
export function getTopContacts(limit = 10) {
  const messages = getProcessedMessages();

  // Group by contact
  const contactStats = {};

  messages.forEach(msg => {
    const contactId = msg.contact_id || 'Unknown';
    if (!contactStats[contactId]) {
      contactStats[contactId] = {
        id: contactId,
        sent: 0,
        received: 0,
        total: 0,
        firstMessage: msg.date,
        lastMessage: msg.date
      };
    }

    if (msg.is_from_me) {
      contactStats[contactId].sent++;
    } else {
      contactStats[contactId].received++;
    }
    contactStats[contactId].total++;
    contactStats[contactId].lastMessage = msg.date;
  });

  // Sort by total and get top contacts
  const topContacts = Object.values(contactStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map(contact => ({
      ...contact,
      name: getContactName(contact.id) || contact.id,
      ratio: contact.sent / (contact.received || 1),
      personality: getMessagingPersonality(contact.sent, contact.received)
    }));

  return topContacts;
}

function getMessagingPersonality(sent, received) {
  const ratio = sent / (received || 1);
  if (ratio > 1.5) return 'Initiator';
  if (ratio < 0.67) return 'Responder';
  return 'Balanced';
}

// Activity patterns (hourly/daily heatmap)
export function getActivityPatterns() {
  const messages = getProcessedMessages();

  // Hourly distribution (0-23)
  const hourly = Array(24).fill(0);

  // Day of week distribution (0=Sunday, 6=Saturday)
  const dayOfWeek = Array(7).fill(0);

  // Heatmap data: day of week x hour
  const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));

  // Monthly trend
  const monthly = {};

  messages.forEach(msg => {
    if (!msg.date) return;

    const hour = msg.date.getHours();
    const day = msg.date.getDay();
    const monthKey = `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`;

    hourly[hour]++;
    dayOfWeek[day]++;
    heatmap[day][hour]++;
    monthly[monthKey] = (monthly[monthKey] || 0) + 1;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    hourly: hourly.map((count, hour) => ({
      hour,
      label: `${hour}:00`,
      count
    })),
    dayOfWeek: dayOfWeek.map((count, day) => ({
      day,
      label: dayNames[day],
      count
    })),
    heatmap: heatmap.map((hours, day) => ({
      day: dayNames[day],
      hours: hours.map((count, hour) => ({ hour, count }))
    })),
    monthly: Object.entries(monthly)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }))
  };
}

// Response time analysis
export function getResponseTimes() {
  const messages = getProcessedMessages();

  // Group messages by conversation
  const conversations = {};

  messages.forEach(msg => {
    const convoId = msg.chat_identifier || msg.contact_id || 'unknown';
    if (!conversations[convoId]) {
      conversations[convoId] = [];
    }
    conversations[convoId].push(msg);
  });

  // Calculate response times per contact
  const contactResponseTimes = {};

  Object.entries(conversations).forEach(([convoId, msgs]) => {
    const sortedMsgs = msgs.sort((a, b) => a.date - b.date);

    let myResponseTimes = [];
    let theirResponseTimes = [];

    for (let i = 1; i < sortedMsgs.length; i++) {
      const prev = sortedMsgs[i - 1];
      const curr = sortedMsgs[i];

      if (!prev.date || !curr.date) continue;

      const timeDiff = (curr.date - prev.date) / 1000 / 60; // minutes

      // Only count responses within 24 hours
      if (timeDiff > 1440) continue;

      // If previous was from them and current is from me = my response time
      if (!prev.is_from_me && curr.is_from_me) {
        myResponseTimes.push(timeDiff);
      }
      // If previous was from me and current is from them = their response time
      else if (prev.is_from_me && !curr.is_from_me) {
        theirResponseTimes.push(timeDiff);
      }
    }

    const contactId = sortedMsgs[0]?.contact_id || convoId;

    if (myResponseTimes.length > 0 || theirResponseTimes.length > 0) {
      contactResponseTimes[contactId] = {
        id: contactId,
        name: getContactName(contactId) || contactId,
        myAvgResponse: myResponseTimes.length > 0
          ? myResponseTimes.reduce((a, b) => a + b, 0) / myResponseTimes.length
          : null,
        theirAvgResponse: theirResponseTimes.length > 0
          ? theirResponseTimes.reduce((a, b) => a + b, 0) / theirResponseTimes.length
          : null,
        sampleSize: myResponseTimes.length + theirResponseTimes.length
      };
    }
  });

  const contacts = Object.values(contactResponseTimes)
    .filter(c => c.sampleSize >= 10); // Only include contacts with enough data

  // Overall averages
  const allMyResponses = contacts.filter(c => c.myAvgResponse !== null);
  const allTheirResponses = contacts.filter(c => c.theirAvgResponse !== null);

  const overallMyAvg = allMyResponses.length > 0
    ? allMyResponses.reduce((sum, c) => sum + c.myAvgResponse, 0) / allMyResponses.length
    : null;

  const overallTheirAvg = allTheirResponses.length > 0
    ? allTheirResponses.reduce((sum, c) => sum + c.theirAvgResponse, 0) / allTheirResponses.length
    : null;

  return {
    overallMyAvgMinutes: overallMyAvg,
    overallTheirAvgMinutes: overallTheirAvg,
    fastestRepliesTo: contacts
      .filter(c => c.myAvgResponse !== null)
      .sort((a, b) => a.myAvgResponse - b.myAvgResponse)
      .slice(0, 5),
    fastestRepliersFrom: contacts
      .filter(c => c.theirAvgResponse !== null)
      .sort((a, b) => a.theirAvgResponse - b.theirAvgResponse)
      .slice(0, 5)
  };
}

// Emoji statistics
export function getEmojiStats() {
  const messages = getProcessedMessages();

  // Emoji regex (covers most common emojis)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

  const emojiCount = {};
  const emojiByContact = {};
  const emojiByMonth = {};

  messages.forEach(msg => {
    if (!msg.text) return;

    const emojis = msg.text.match(emojiRegex) || [];
    const contactId = msg.contact_id || 'Unknown';
    const monthKey = msg.date
      ? `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`
      : 'Unknown';

    emojis.forEach(emoji => {
      // Overall count
      emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;

      // By contact
      if (!emojiByContact[contactId]) {
        emojiByContact[contactId] = {};
      }
      emojiByContact[contactId][emoji] = (emojiByContact[contactId][emoji] || 0) + 1;

      // By month
      if (!emojiByMonth[monthKey]) {
        emojiByMonth[monthKey] = {};
      }
      emojiByMonth[monthKey][emoji] = (emojiByMonth[monthKey][emoji] || 0) + 1;
    });
  });

  // Get top emojis overall
  const topEmojis = Object.entries(emojiCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([emoji, count]) => ({ emoji, count }));

  // Get top emoji per contact (for top contacts)
  const topEmojiByContact = Object.entries(emojiByContact)
    .map(([contactId, emojis]) => {
      const top = Object.entries(emojis)
        .sort((a, b) => b[1] - a[1])[0];
      return {
        contactId,
        topEmoji: top ? top[0] : null,
        count: top ? top[1] : 0
      };
    })
    .filter(c => c.topEmoji)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Monthly emoji trends
  const monthlyTrend = Object.entries(emojiByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, emojis]) => ({
      month,
      totalEmojis: Object.values(emojis).reduce((a, b) => a + b, 0),
      topEmoji: Object.entries(emojis).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    }));

  // Calculate date range for per-day average
  const messagesWithDates = messages.filter(m => m.date);
  const firstMessage = messagesWithDates.length > 0 ? messagesWithDates[0].date : null;
  const lastMessage = messagesWithDates.length > 0 ? messagesWithDates[messagesWithDates.length - 1].date : null;
  const daySpan = firstMessage && lastMessage
    ? Math.max(1, Math.ceil((lastMessage - firstMessage) / (1000 * 60 * 60 * 24)))
    : 1;

  const totalEmojis = Object.values(emojiCount).reduce((a, b) => a + b, 0);

  return {
    totalEmojis,
    uniqueEmojis: Object.keys(emojiCount).length,
    topEmojis,
    topEmojiByContact,
    monthlyTrend,
    perDayAvg: Math.round(totalEmojis / daySpan)
  };
}

// Word frequency for word cloud
export function getWordFrequency() {
  const messages = getProcessedMessages();

  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'did', 'does',
    'am', 'im', 'dont', 'cant', 'wont', 'didnt', 'isnt', 'arent', 'wasnt', 'werent',
    'yeah', 'yes', 'no', 'ok', 'okay', 'lol', 'haha', 'hahaha', 'lmao', 'omg',
    'got', 'gonna', 'gotta', 'wanna', 'kinda', 'really', 'very', 'much', 'too',
    'thing', 'things', 'stuff', 'lot', 'lots', 'still', 'here', 'there', 'where',
    'why', 'been', 'being', 'more', 'should', 'would', 'could', 'might', 'must',
    'let', 'lets', 'maybe', 'actually', 'probably', 'already', 'right', 'sure',
    'though', 'thought', 'something', 'anything', 'everything', 'nothing',
    'someone', 'anyone', 'everyone', 'noone', 'nobody', 'everybody', 'somebody',
    'www', 'com', 'http', 'https', 'org', 'net', 'edu', 'gov', 'html', 'htm'
  ]);

  const wordCount = {};

  messages.forEach(msg => {
    if (!msg.text || !msg.is_from_me) return; // Only count words YOU sent

    // Clean and tokenize
    const words = msg.text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word));

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  // Get top words for word cloud
  const wordCloud = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([text, value]) => ({ text, value }));

  return {
    totalWords: Object.values(wordCount).reduce((a, b) => a + b, 0),
    uniqueWords: Object.keys(wordCount).length,
    wordCloud
  };
}

// Simple sentiment analysis
export function getSentimentAnalysis() {
  const messages = getProcessedMessages();

  // Simple positive/negative word lists
  const positiveWords = new Set([
    'love', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'excellent',
    'good', 'happy', 'glad', 'excited', 'beautiful', 'perfect', 'best', 'nice',
    'thanks', 'thank', 'appreciate', 'grateful', 'blessed', 'yay', 'congrats',
    'congratulations', 'fun', 'enjoy', 'enjoyed', 'lovely', 'sweet', 'cool',
    'brilliant', 'incredible', 'superb', 'outstanding', 'delightful', 'pleased',
    'thrilled', 'fortunate', 'lucky', 'proud', 'success', 'successful', 'win',
    'celebrate', 'celebration', 'joy', 'joyful', 'wonderful', 'terrific'
  ]);

  const negativeWords = new Set([
    'hate', 'bad', 'awful', 'terrible', 'horrible', 'worst', 'sad', 'angry',
    'upset', 'disappointed', 'frustrated', 'annoyed', 'annoying', 'stupid',
    'dumb', 'boring', 'fail', 'failed', 'failure', 'wrong', 'mistake', 'sorry',
    'unfortunately', 'problem', 'problems', 'issue', 'issues', 'difficult',
    'hard', 'struggle', 'struggling', 'stress', 'stressed', 'worried', 'worry',
    'anxious', 'anxiety', 'scared', 'fear', 'afraid', 'nervous', 'sick', 'tired',
    'exhausted', 'overwhelmed', 'confused', 'lost', 'broken', 'hurt', 'pain'
  ]);

  const sentimentByContact = {};
  const sentimentByMonth = {};
  let overallPositive = 0;
  let overallNegative = 0;
  let overallNeutral = 0;

  messages.forEach(msg => {
    if (!msg.text) return;

    const words = msg.text.toLowerCase().split(/\s+/);
    let positive = 0;
    let negative = 0;

    words.forEach(word => {
      if (positiveWords.has(word)) positive++;
      if (negativeWords.has(word)) negative++;
    });

    const sentiment = positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';

    // Overall counts
    if (sentiment === 'positive') overallPositive++;
    else if (sentiment === 'negative') overallNegative++;
    else overallNeutral++;

    // By contact
    const contactId = msg.contact_id || 'Unknown';
    if (!sentimentByContact[contactId]) {
      sentimentByContact[contactId] = { positive: 0, negative: 0, neutral: 0, total: 0 };
    }
    sentimentByContact[contactId][sentiment]++;
    sentimentByContact[contactId].total++;

    // By month
    const monthKey = msg.date
      ? `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`
      : 'Unknown';
    if (!sentimentByMonth[monthKey]) {
      sentimentByMonth[monthKey] = { positive: 0, negative: 0, neutral: 0, total: 0 };
    }
    sentimentByMonth[monthKey][sentiment]++;
    sentimentByMonth[monthKey].total++;
  });

  // Calculate positivity scores
  const contactScores = Object.entries(sentimentByContact)
    .filter(([_, data]) => data.total >= 20)
    .map(([contactId, data]) => ({
      contactId,
      name: getContactName(contactId) || contactId,
      positivityScore: ((data.positive - data.negative) / data.total * 100).toFixed(1),
      ...data
    }))
    .sort((a, b) => b.positivityScore - a.positivityScore);

  // Monthly trend
  const monthlyTrend = Object.entries(sentimentByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month,
      positivityScore: ((data.positive - data.negative) / data.total * 100).toFixed(1),
      ...data
    }));

  const total = overallPositive + overallNegative + overallNeutral;

  return {
    overall: {
      positive: overallPositive,
      negative: overallNegative,
      neutral: overallNeutral,
      total,
      positivityScore: ((overallPositive - overallNegative) / total * 100).toFixed(1)
    },
    mostPositiveContacts: contactScores.slice(0, 5),
    mostNegativeContacts: contactScores.slice(-5).reverse(),
    monthlyTrend
  };
}
