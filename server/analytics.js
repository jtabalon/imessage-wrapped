import { getMessages2025, appleTimestampToDate, getHandles, getDatabase, getContactName, isDisplayableIdentifier, getStickerMessages, getGroupChatMembers } from './db.js';

// Helper: format a Date as YYYY-MM-DD in local time
function toDateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Common stop words to exclude (shared by word frequency + group chat analytics)
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
  'www', 'com', 'http', 'https', 'org', 'net', 'edu', 'gov', 'html', 'htm',
  // Contraction fragments left after apostrophe stripping (don't → don, didn't → didn, etc.)
  'don', 'didn', 'won', 'wouldn', 'couldn', 'shouldn', 'isn', 'aren', 'wasn', 'weren', 'doesn', 'hasn', 'hadn', 'haven'
]);

// Common texting abbreviations (used by textingStyle insight)
const abbreviations = new Set([
  'lol', 'lmao', 'idk', 'ngl', 'tbh', 'omg', 'bruh', 'hmu', 'wyd', 'btw',
  'fyi', 'rn', 'pls', 'plz', 'bc', 'ur', 'smh', 'imo', 'imho', 'tho',
  'nvm', 'irl', 'afk', 'brb', 'gtg', 'ttyl', 'ily', 'ilysm', 'ong', 'fr',
  'icymi', 'tldr', 'jk', 'rofl', 'stfu', 'nah', 'yea', 'yep', 'ya', 'ye',
  'ty', 'thx', 'tysm', 'np', 'yw', 'ofc', 'obvi', 'lowkey', 'highkey',
  'deadass', 'bet', 'fam', 'bro', 'sis', 'dude', 'yall', 'gotta', 'gonna',
  'wanna', 'kinda', 'sorta', 'tryna', 'boutta', 'finna', 'ion', 'ight',
  'aight', 'lmk', 'dm', 'pm', 'haha', 'hahaha', 'omfg', 'wtf', 'wth',
  'smth', 'sth', 'abt', 'w', 'u', 'r', 'k', 'y', 'n', 'b', 'msg', 'pic',
  'def', 'prob', 'tho', 'doe', 'fomo', 'goat', 'sus', 'cap', 'nocap', 'slay'
]);

// Approximate English conversational frequency per million words (baseline for catchphrases)
// Only includes words NOT in stopWords so we can compute overuse ratios.
const englishFrequency = new Map([
  ['love', 200], ['hate', 30], ['feel', 60], ['feeling', 40], ['life', 50],
  ['world', 40], ['home', 50], ['food', 25], ['eat', 30], ['sleep', 20],
  ['morning', 30], ['night', 40], ['tonight', 15], ['today', 60], ['tomorrow', 30],
  ['yesterday', 15], ['weekend', 15], ['week', 40], ['month', 20], ['always', 40],
  ['never', 40], ['forever', 10], ['literally', 30], ['basically', 15],
  ['honestly', 20], ['seriously', 15], ['definitely', 20], ['absolutely', 15],
  ['obviously', 10], ['apparently', 8], ['exactly', 20], ['completely', 12],
  ['totally', 15], ['pretty', 30], ['quite', 15], ['super', 20], ['crazy', 20],
  ['funny', 20], ['cool', 20], ['nice', 25], ['sweet', 15], ['cute', 15],
  ['awesome', 15], ['amazing', 15], ['beautiful', 15], ['perfect', 20],
  ['great', 40], ['best', 30], ['worst', 10], ['better', 30], ['worse', 8],
  ['happy', 25], ['sad', 15], ['mad', 10], ['angry', 8], ['excited', 12],
  ['scared', 8], ['tired', 15], ['sick', 12], ['sorry', 30], ['please', 30],
  ['thanks', 40], ['thank', 35], ['welcome', 15], ['help', 30], ['need', 50],
  ['keep', 25], ['stop', 20], ['start', 20], ['try', 30], ['trying', 25],
  ['hope', 25], ['wish', 15], ['wait', 20], ['waiting', 12], ['watch', 15],
  ['play', 20], ['read', 15], ['talk', 20], ['talking', 15], ['call', 25],
  ['send', 15], ['told', 20], ['said', 35], ['asked', 15], ['friend', 20],
  ['friends', 20], ['family', 15], ['baby', 15], ['girl', 15], ['guy', 15],
  ['man', 25], ['woman', 10], ['kids', 12],
  ['game', 20], ['movie', 12], ['music', 12], ['song', 10], ['book', 12],
  ['show', 20], ['car', 15], ['phone', 15], ['school', 15], ['class', 15],
  ['job', 15], ['money', 20], ['pay', 15], ['buy', 15],
  ['free', 15], ['late', 15], ['early', 10], ['soon', 15], ['ready', 15],
  ['done', 25], ['fine', 20], ['real', 15], ['true', 15], ['wrong', 15],
  ['bad', 25], ['hard', 20], ['easy', 12], ['long', 20], ['big', 15],
  ['little', 25], ['old', 20], ['young', 8], ['next', 20], ['last', 25],
  ['different', 12], ['same', 20], ['whole', 12], ['every', 20], ['own', 15],
  ['place', 15], ['house', 15], ['room', 12], ['water', 12],
  ['drink', 12], ['dinner', 10], ['lunch', 10], ['breakfast', 8], ['coffee', 8],
  ['pizza', 5], ['chicken', 5],
  ['dude', 8], ['bro', 8], ['fam', 3], ['vibes', 3], ['vibe', 3],
  ['chill', 5], ['sick', 8], ['fire', 5], ['lit', 3], ['bet', 5],
  ['low', 10], ['high', 10], ['run', 15], ['walk', 10], ['drive', 10],
  ['miss', 15], ['remember', 15], ['forget', 10], ['believe', 12],
  ['understand', 12], ['guess', 12], ['mean', 20], ['matter', 10],
  ['care', 15], ['worry', 10], ['mind', 15], ['point', 12], ['part', 15],
  ['deal', 10], ['head', 10], ['hand', 10], ['face', 10], ['eye', 8],
  ['heart', 10], ['god', 15], ['damn', 10], ['shit', 15], ['fuck', 12],
  ['hell', 10], ['ass', 8], ['crap', 5], ['dumb', 5], ['stupid', 8],
  ['weird', 8], ['random', 5], ['fun', 15], ['enjoy', 8], ['glad', 8],
  ['favorite', 8], ['kind', 15], ['half', 10], ['couple', 8], ['either', 10],
  ['unless', 8], ['perhaps', 5], ['whether', 5], ['towards', 5],
  ['between', 10], ['along', 8], ['around', 15], ['through', 15],
  ['together', 12], ['against', 8], ['without', 12], ['within', 5],
  ['enough', 15], ['least', 10], ['less', 10], ['else', 15]
]);

// Detect iMessage tapback reactions (e.g. 'Loved "Hey!"', 'Laughed at an image')
const reactionPrefixRegex = /^(Loved|Liked|Disliked|Laughed at|Emphasized|Questioned) ("|\u{201c}|an )/u;

// Emoji regex (shared by emoji stats + group chat analytics)
const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

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

// Centralized display-name resolver: returns null for opaque/hash identifiers
// so they can be filtered out downstream instead of leaking into the UI.
function getDisplayName(identifier) {
  const name = getContactName(identifier);
  if (name) return name;
  if (isDisplayableIdentifier(identifier)) return identifier;
  return null;
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

  // Sort by total and get top contacts (exclude Unknown and hash-like identifiers)
  const topContacts = Object.values(contactStats)
    .filter(c => c.id !== 'Unknown' && getDisplayName(c.id))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map(contact => ({
      ...contact,
      name: getDisplayName(contact.id),
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
        name: getDisplayName(contactId),
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
    .filter(c => c.sampleSize >= 10 && c.name); // Only include contacts with enough data and displayable names

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

// Word frequency for word cloud + vocabulary insights
export function getWordFrequency() {
  const messages = getProcessedMessages();

  // --- Existing accumulators ---
  const wordCount = {};

  // --- New accumulators for 5 insights ---
  // 1: Vocabulary by contact (TF-IDF)
  const wordsPerContact = {};   // { contactId: { word: count } }
  // 2: Vocabulary evolution
  const wordsByMonth = {};      // { monthKey: { word: count } }
  // 3: Message length
  const contactMessageLengths = {}; // { contactId: { totalWords, messageCount } }
  const lengthBuckets = { '1-5': 0, '6-15': 0, '16-30': 0, '31+': 0 };
  let totalMessageWords = 0;
  let totalMessageCount = 0;
  // Top messages per contact (for clickable bar chart detail)
  const topMessagesByContact = {}; // { contactId: [{ text, wordCount, date }] }
  // 5: Texting style
  const abbreviationCounts = {};
  let abbreviationsUsed = 0;
  let fullWordsUsed = 0;
  let allCapsMessages = 0;
  let totalExclamationMarks = 0;

  // --- Single-pass data collection ---
  messages.forEach(msg => {
    if (!msg.text || !msg.is_from_me) return;
    if (reactionPrefixRegex.test(msg.text)) return;

    // For sent messages, contact_id is null (handle_id=0), so use chat_identifier.
    // Skip group chats (chat...) for per-contact analysis since they mix recipients.
    const chatId = msg.chat_identifier || '';
    const isGroupChat = chatId.startsWith('chat');
    const contactId = msg.contact_id || (isGroupChat ? null : chatId) || 'Unknown';
    const monthKey = msg.date
      ? `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`
      : null;

    // --- Standard tokenization (stop-word-filtered, length > 2) for insights 1/2/4 ---
    const words = msg.text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word));

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;

      // 1: Per-contact word counts
      if (!wordsPerContact[contactId]) wordsPerContact[contactId] = {};
      wordsPerContact[contactId][word] = (wordsPerContact[contactId][word] || 0) + 1;

      // 2: Per-month word counts
      if (monthKey) {
        if (!wordsByMonth[monthKey]) wordsByMonth[monthKey] = {};
        wordsByMonth[monthKey][word] = (wordsByMonth[monthKey][word] || 0) + 1;
      }
    });

    // --- Raw word count for insight 3 (message length) ---
    const rawWords = msg.text.trim().split(/\s+/).filter(w => w.length > 0);
    const rawLen = rawWords.length;
    totalMessageWords += rawLen;
    totalMessageCount++;

    if (!contactMessageLengths[contactId]) {
      contactMessageLengths[contactId] = { totalWords: 0, messageCount: 0 };
    }
    contactMessageLengths[contactId].totalWords += rawLen;
    contactMessageLengths[contactId].messageCount++;

    if (rawLen <= 5) lengthBuckets['1-5']++;
    else if (rawLen <= 15) lengthBuckets['6-15']++;
    else if (rawLen <= 30) lengthBuckets['16-30']++;
    else lengthBuckets['31+']++;

    // Collect top 3 longest messages per contact (for clickable detail)
    if (contactId !== 'Unknown' && rawLen >= 10) {
      if (!topMessagesByContact[contactId]) topMessagesByContact[contactId] = [];
      const arr = topMessagesByContact[contactId];
      arr.push({ text: msg.text, wordCount: rawLen, date: msg.date });
      // Keep only top 3 by word count to bound memory
      if (arr.length > 3) {
        arr.sort((a, b) => b.wordCount - a.wordCount);
        arr.length = 3;
      }
    }

    // --- Texting style tokenization (includes short words) for insight 5 ---
    const allTokens = msg.text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0 && !/^\d+$/.test(t));

    allTokens.forEach(token => {
      if (abbreviations.has(token)) {
        abbreviationCounts[token] = (abbreviationCounts[token] || 0) + 1;
        abbreviationsUsed++;
      } else if (token.length > 1) {
        fullWordsUsed++;
      }
    });

    // All-caps detection (messages with 3+ words entirely in caps)
    const originalWords = msg.text.trim().split(/\s+/).filter(w => w.length > 1 && /^[A-Z]+$/.test(w));
    if (originalWords.length >= 3) allCapsMessages++;

    // Exclamation marks
    totalExclamationMarks += (msg.text.match(/!/g) || []).length;
  });

  // ============================================================
  // Existing return data
  // ============================================================
  const totalWords = Object.values(wordCount).reduce((a, b) => a + b, 0);

  const wordCloud = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([text, value]) => ({ text, value }));

  // ============================================================
  // 1: vocabularyByContact (TF-IDF)
  // ============================================================
  let vocabularyByContact = [];
  try {
    const numContacts = Object.keys(wordsPerContact).length;

    // Build document-frequency map: how many contacts use each word
    const docFrequency = {};
    Object.values(wordsPerContact).forEach(wordMap => {
      Object.keys(wordMap).forEach(word => {
        docFrequency[word] = (docFrequency[word] || 0) + 1;
      });
    });

    vocabularyByContact = Object.entries(wordsPerContact)
      .map(([contactId, wordMap]) => {
        const name = getDisplayName(contactId);
        const contactTotal = Object.values(wordMap).reduce((a, b) => a + b, 0);
        return { contactId, name, totalWords: contactTotal, wordMap };
      })
      .filter(c => c.name && c.totalWords >= 30)
      .sort((a, b) => b.totalWords - a.totalWords)
      .slice(0, 8)
      .map(({ contactId, name, totalWords: cTotal, wordMap }) => {
        const distinctiveWords = Object.entries(wordMap)
          .filter(([_, count]) => count >= 3)
          .map(([word, count]) => {
            const tf = count / cTotal;
            const idf = Math.log(numContacts / (docFrequency[word] || 1));
            return { word, score: Math.round(tf * idf * 10000) / 10000, count };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        return { name, contactId, totalWords: cTotal, distinctiveWords };
      });
  } catch (err) {
    console.error('Error computing vocabularyByContact:', err);
  }

  // ============================================================
  // 2: vocabularyEvolution (monthly trends)
  // ============================================================
  let vocabularyEvolution = null;
  try {
    const sortedMonths = Object.keys(wordsByMonth).sort();

    const monthlyTrends = sortedMonths.map((month, idx) => {
      const currWords = wordsByMonth[month];
      const prevWords = idx > 0 ? wordsByMonth[sortedMonths[idx - 1]] : {};

      const trendingUp = Object.entries(currWords)
        .filter(([word, count]) => {
          if (count < 5) return false;
          const prev = prevWords[word] || 0;
          return prev === 0 || count >= prev * 2;
        })
        .map(([word, count]) => ({ word, count, prevCount: prevWords[word] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const fadingAway = Object.entries(prevWords || {})
        .filter(([word, prevCount]) => {
          if (prevCount < 5) return false;
          const curr = currWords[word] || 0;
          return curr <= prevCount * 0.5;
        })
        .map(([word, prevCount]) => ({ word, count: currWords[word] || 0, prevCount }))
        .sort((a, b) => b.prevCount - a.prevCount)
        .slice(0, 3);

      return { month, trendingUp, fadingAway };
    });

    // Tracked words: top 4 overall words with monthly breakdown
    const top4Words = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([word]) => word);

    const trackedWords = top4Words.map(word => ({
      word,
      monthlyCounts: sortedMonths.map(month => ({
        month,
        count: wordsByMonth[month]?.[word] || 0
      }))
    }));

    vocabularyEvolution = {
      months: monthlyTrends,
      trackedWords
    };
  } catch (err) {
    console.error('Error computing vocabularyEvolution:', err);
  }

  // ============================================================
  // 3: messageLength
  // ============================================================
  let messageLength = null;
  try {
    const overallAvg = totalMessageCount > 0
      ? Math.round((totalMessageWords / totalMessageCount) * 10) / 10
      : 0;

    const contactLengthEntries = Object.entries(contactMessageLengths)
      .map(([contactId, data]) => ({
        contactId,
        name: getDisplayName(contactId),
        avgWords: Math.round((data.totalWords / data.messageCount) * 10) / 10,
        messageCount: data.messageCount
      }))
      .filter(c => c.name && c.messageCount >= 10);

    const longestMessagesTo = [...contactLengthEntries]
      .sort((a, b) => b.avgWords - a.avgWords)
      .slice(0, 5)
      .map(c => ({
        ...c,
        topMessages: (topMessagesByContact[c.contactId] || [])
          .sort((a, b) => b.wordCount - a.wordCount)
          .slice(0, 3)
          .map(m => ({
            text: m.text.length > 200 ? m.text.slice(0, 200) + '...' : m.text,
            wordCount: m.wordCount,
            date: m.date ? toDateString(m.date) : null
          }))
      }));

    const shortestMessagesTo = [...contactLengthEntries]
      .sort((a, b) => a.avgWords - b.avgWords)
      .slice(0, 5);

    const lengthDistribution = [
      { range: '1-5 words', count: lengthBuckets['1-5'] },
      { range: '6-15 words', count: lengthBuckets['6-15'] },
      { range: '16-30 words', count: lengthBuckets['16-30'] },
      { range: '31+ words', count: lengthBuckets['31+'] }
    ];

    messageLength = {
      overallAvg,
      totalMessages: totalMessageCount,
      longestMessagesTo,
      shortestMessagesTo,
      lengthDistribution
    };
  } catch (err) {
    console.error('Error computing messageLength:', err);
  }

  // ============================================================
  // 4: catchphrases (signature words vs English baseline)
  // ============================================================
  let catchphrases = [];
  try {
    if (totalWords >= 1000) {
      const userFreqPerMillion = (count) => (count / totalWords) * 1_000_000;

      catchphrases = Object.entries(wordCount)
        .filter(([word, count]) => count >= 10 && englishFrequency.has(word))
        .map(([word, count]) => {
          const typical = englishFrequency.get(word);
          const userFreq = userFreqPerMillion(count);
          const overuseRatio = Math.round((userFreq / typical) * 10) / 10;
          return { word, count, typicalFrequency: typical, overuseRatio };
        })
        .filter(entry => entry.overuseRatio > 1)
        .sort((a, b) => b.overuseRatio - a.overuseRatio)
        .slice(0, 10);
    }
  } catch (err) {
    console.error('Error computing catchphrases:', err);
  }

  // ============================================================
  // 5: textingStyle (formality / abbreviation analysis)
  // ============================================================
  let textingStyle = null;
  try {
    const totalStyleWords = abbreviationsUsed + fullWordsUsed;
    const abbrRatio = totalStyleWords > 0 ? abbreviationsUsed / totalStyleWords : 0;
    // Formality: 100 = all full words, 0 = all abbreviations
    const formalityScore = Math.round((1 - abbrRatio) * 100);

    let textingLabel;
    if (formalityScore >= 85) textingLabel = 'Formal Writer';
    else if (formalityScore >= 65) textingLabel = 'Balanced';
    else if (formalityScore >= 40) textingLabel = 'Casual Texter';
    else textingLabel = 'Abbreviation Enthusiast';

    const topAbbreviations = Object.entries(abbreviationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    const avgExclamationMarks = totalMessageCount > 0
      ? Math.round((totalExclamationMarks / totalMessageCount) * 100) / 100
      : 0;

    textingStyle = totalStyleWords >= 100 ? {
      formalityScore,
      abbreviationsUsed,
      fullWordsUsed,
      topAbbreviations,
      label: textingLabel,
      allCapsMessages,
      avgExclamationMarks
    } : null;
  } catch (err) {
    console.error('Error computing textingStyle:', err);
  }

  // ============================================================
  // Return combined shape
  // ============================================================
  return {
    totalWords,
    uniqueWords: Object.keys(wordCount).length,
    wordCloud,
    vocabularyByContact,
    vocabularyEvolution,
    messageLength,
    catchphrases,
    textingStyle
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
    if (reactionPrefixRegex.test(msg.text)) return; // Skip tapback reactions

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
      name: getDisplayName(contactId),
      positivityScore: ((data.positive - data.negative) / data.total * 100).toFixed(1),
      ...data
    }))
    .filter(c => c.name)
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

// Sticker statistics
export function getStickerStats() {
  const rawStickers = getStickerMessages();

  if (rawStickers.length === 0) {
    return {
      totalStickers: 0,
      sent: 0,
      received: 0,
      uniqueStickers: 0,
      topStickersSent: [],
      topStickersReceived: [],
      topStickersOverall: [],
      topStickerSentTo: [],
      topStickerReceivedFrom: [],
      monthlyTrend: []
    };
  }

  // Process rows: convert timestamps, derive sticker key
  const stickers = rawStickers.map(row => ({
    ...row,
    date: appleTimestampToDate(row.date),
    stickerKey: row.transfer_name || row.filename || `attachment_${row.attachment_id}`
  }));

  const sent = stickers.filter(s => s.is_from_me);
  const received = stickers.filter(s => !s.is_from_me);
  const uniqueKeys = new Set(stickers.map(s => s.stickerKey));

  // Helper: count stickers by key, track top contact per sticker, return top N
  function topByKey(list, limit = 10) {
    const counts = {};
    list.forEach(s => {
      if (!counts[s.stickerKey]) {
        counts[s.stickerKey] = { stickerKey: s.stickerKey, filename: s.filename, transfer_name: s.transfer_name, count: 0, contactCounts: {} };
      }
      counts[s.stickerKey].count++;
      const contactId = s.contact_id || 'Unknown';
      counts[s.stickerKey].contactCounts[contactId] = (counts[s.stickerKey].contactCounts[contactId] || 0) + 1;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ contactCounts, ...rest }) => {
        const topContact = Object.entries(contactCounts).sort((a, b) => b[1] - a[1])[0];
        return { ...rest, topContact: topContact ? (getDisplayName(topContact[0]) || null) : null };
      });
  }

  // Per-contact favorite sticker (split by sent to / received from)
  function perContactTopSticker(list) {
    const contactStickers = {};
    list.forEach(s => {
      const contactId = s.contact_id || 'Unknown';
      if (!contactStickers[contactId]) contactStickers[contactId] = {};
      if (!contactStickers[contactId][s.stickerKey]) {
        contactStickers[contactId][s.stickerKey] = { stickerKey: s.stickerKey, filename: s.filename, transfer_name: s.transfer_name, count: 0 };
      }
      contactStickers[contactId][s.stickerKey].count++;
    });
    return Object.entries(contactStickers)
      .map(([contactId, stickerMap]) => {
        const top = Object.values(stickerMap).sort((a, b) => b.count - a.count)[0];
        return {
          contactId,
          name: getDisplayName(contactId),
          favoriteSticker: top
        };
      })
      .filter(c => c.favoriteSticker && c.name)
      .sort((a, b) => b.favoriteSticker.count - a.favoriteSticker.count)
      .slice(0, 5);
  }
  const topStickerSentTo = perContactTopSticker(sent);
  const topStickerReceivedFrom = perContactTopSticker(received);

  // Monthly sticker usage trend (sent vs received)
  const monthlyCounts = {};
  stickers.forEach(s => {
    if (!s.date) return;
    const monthKey = `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyCounts[monthKey]) monthlyCounts[monthKey] = { sent: 0, received: 0 };
    if (s.is_from_me) {
      monthlyCounts[monthKey].sent++;
    } else {
      monthlyCounts[monthKey].received++;
    }
  });
  const monthlyTrend = Object.entries(monthlyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, counts]) => ({ month, sent: counts.sent, received: counts.received }));

  return {
    totalStickers: stickers.length,
    sent: sent.length,
    received: received.length,
    uniqueStickers: uniqueKeys.size,
    topStickersSent: topByKey(sent),
    topStickersReceived: topByKey(received),
    topStickersOverall: topByKey(stickers),
    topStickerSentTo,
    topStickerReceivedFrom,
    monthlyTrend
  };
}

// Streak statistics (Snapchat-style consecutive mutual messaging days)
export function getStreakStats() {
  const messages = getProcessedMessages();

  // Step 1: Group messages by contact_id, then by date, tracking sent/received
  const contactDays = {}; // { contactId: { "YYYY-MM-DD": { sent: bool, received: bool, lastIsFromMe: bool } } }

  messages.forEach(msg => {
    if (!msg.date) return;
    // Skip group chat messages — streaks only count 1:1 conversations
    if (msg.chat_identifier && msg.chat_identifier.startsWith('chat')) return;

    const contactId = msg.contact_id || 'Unknown';
    const dateStr = toDateString(msg.date);

    if (!contactDays[contactId]) contactDays[contactId] = {};
    if (!contactDays[contactId][dateStr]) {
      contactDays[contactId][dateStr] = { sent: false, received: false, lastIsFromMe: null };
    }

    if (msg.is_from_me) {
      contactDays[contactId][dateStr].sent = true;
    } else {
      contactDays[contactId][dateStr].received = true;
    }
    contactDays[contactId][dateStr].lastIsFromMe = !!msg.is_from_me;
  });

  const todayStr = toDateString(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toDateString(yesterdayDate);

  const MILESTONES = [7, 30, 100, 365];

  // Step 2: For each contact, build sorted mutual days and find streaks
  const allStreaks = []; // { contactId, name, length, startDate, endDate, isActive, milestonesReached, milestoneUnlockDates }
  const contactBestStreaks = {}; // contactId -> { longest streak info, current streak info }

  Object.entries(contactDays).forEach(([contactId, days]) => {
    // Get sorted mutual days (both sent AND received)
    const mutualDays = Object.entries(days)
      .filter(([_, info]) => info.sent && info.received)
      .map(([dateStr]) => dateStr)
      .sort();

    if (mutualDays.length === 0) return;

    const name = getDisplayName(contactId);
    if (!name) return; // skip hash-like identifiers

    // Walk through mutual days finding consecutive runs
    let streakStart = mutualDays[0];
    let streakLength = 1;
    const streaks = [];

    for (let i = 1; i < mutualDays.length; i++) {
      const prevDate = new Date(mutualDays[i - 1]);
      const currDate = new Date(mutualDays[i]);
      const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streakLength++;
      } else {
        // Streak ended
        const endDate = mutualDays[i - 1];
        const milestonesReached = MILESTONES.filter(m => streakLength >= m);
        const milestoneUnlockDates = {};
        milestonesReached.forEach(m => {
          const unlockDate = new Date(streakStart);
          unlockDate.setDate(unlockDate.getDate() + m - 1);
          milestoneUnlockDates[m] = toDateString(unlockDate);
        });

        // Determine who let it die: check the day after the streak ended
        const dayAfterEnd = new Date(endDate);
        dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
        const dayAfterStr = toDateString(dayAfterEnd);
        const dayAfterInfo = days[dayAfterStr];
        let whoLetItDie = null;
        if (dayAfterInfo) {
          // Someone messaged but not mutual
          whoLetItDie = dayAfterInfo.sent ? 'them' : 'you';
        } else {
          // Nobody messaged at all - check who sent last on the final day
          const lastDayInfo = days[endDate];
          whoLetItDie = lastDayInfo?.lastIsFromMe ? 'them' : 'you';
        }

        streaks.push({
          contactId, name, length: streakLength,
          startDate: streakStart, endDate,
          milestonesReached, milestoneUnlockDates, whoLetItDie
        });

        streakStart = mutualDays[i];
        streakLength = 1;
      }
    }

    // Handle the last streak in progress
    const lastMutualDay = mutualDays[mutualDays.length - 1];
    const isActive = lastMutualDay === todayStr || lastMutualDay === yesterdayStr;
    const milestonesReached = MILESTONES.filter(m => streakLength >= m);
    const milestoneUnlockDates = {};
    milestonesReached.forEach(m => {
      const unlockDate = new Date(streakStart);
      unlockDate.setDate(unlockDate.getDate() + m - 1);
      milestoneUnlockDates[m] = toDateString(unlockDate);
    });

    if (isActive) {
      streaks.push({
        contactId, name, length: streakLength,
        startDate: streakStart, endDate: lastMutualDay,
        isActive: true, milestonesReached, milestoneUnlockDates, whoLetItDie: null
      });
    } else {
      // Last streak also broke
      const dayAfterEnd = new Date(lastMutualDay);
      dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
      const dayAfterStr = toDateString(dayAfterEnd);
      const dayAfterInfo = days[dayAfterStr];
      let whoLetItDie = null;
      if (dayAfterInfo) {
        whoLetItDie = dayAfterInfo.sent ? 'them' : 'you';
      } else {
        const lastDayInfo = days[lastMutualDay];
        whoLetItDie = lastDayInfo?.lastIsFromMe ? 'them' : 'you';
      }

      streaks.push({
        contactId, name, length: streakLength,
        startDate: streakStart, endDate: lastMutualDay,
        isActive: false, milestonesReached, milestoneUnlockDates, whoLetItDie
      });
    }

    // Track per-contact best
    const longest = streaks.reduce((best, s) => s.length > best.length ? s : best, streaks[0]);
    const activeCurrent = streaks.find(s => s.isActive);

    contactBestStreaks[contactId] = {
      contactId, name,
      longestStreak: longest.length,
      longestStreakStart: longest.startDate,
      longestStreakEnd: longest.endDate,
      currentStreak: activeCurrent ? activeCurrent.length : 0,
      currentStreakStart: activeCurrent ? activeCurrent.startDate : null,
      isActive: !!activeCurrent
    };

    allStreaks.push(...streaks);
  });

  // Option A: Top 10 contacts by longest streak
  const topStreaks = Object.values(contactBestStreaks)
    .sort((a, b) => b.longestStreak - a.longestStreak)
    .slice(0, 10);

  // Option C: Top 5 longest streaks as story cards (enriched with milestones)
  const allSorted = [...allStreaks].sort((a, b) => b.length - a.length);
  const streakStories = allSorted.slice(0, 6).map(s => ({
    contactId: s.contactId,
    name: s.name,
    longestStreak: s.length,
    longestStreakStart: s.startDate,
    longestStreakEnd: s.endDate,
    currentStreak: contactBestStreaks[s.contactId]?.currentStreak || 0,
    isActive: s.isActive,
    milestonesReached: s.milestonesReached,
    milestoneUnlockDates: s.milestoneUnlockDates
  }));

  // Option C: Biggest broken streaks (top 5)
  const brokenStreaks = allStreaks
    .filter(s => !s.isActive && s.length >= 2)
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)
    .map(s => ({
      contactId: s.contactId,
      name: s.name,
      streakLength: s.length,
      endDate: s.endDate,
      whoLetItDie: s.whoLetItDie
    }));

  // Summary stats
  const totalStreaksStarted = allStreaks.filter(s => s.length >= 2).length;
  const streakLengths = allStreaks.filter(s => s.length >= 2).map(s => s.length);
  const totalStreakDays = streakLengths.reduce((sum, l) => sum + l, 0);
  const averageStreakLength = streakLengths.length > 0
    ? Math.round((totalStreakDays / streakLengths.length) * 10) / 10
    : 0;

  const longestOverall = allSorted[0] || null;
  const activeStreaks = allStreaks.filter(s => s.isActive).sort((a, b) => b.length - a.length);
  const longestActive = activeStreaks[0] || null;

  return {
    topStreaks,
    streakStories,
    biggestStreakDeaths: brokenStreaks,
    summary: {
      totalStreaksStarted,
      averageStreakLength,
      totalStreakDays,
      longestOverallStreak: longestOverall ? {
        name: longestOverall.name,
        days: longestOverall.length,
        start: longestOverall.startDate,
        end: longestOverall.endDate
      } : null,
      longestActiveStreak: longestActive ? {
        name: longestActive.name,
        days: longestActive.length,
        start: longestActive.startDate
      } : null,
      activeStreakCount: activeStreaks.length
    }
  };
}

// Group chat analytics (leaderboard, personality profiles, deep dive)
export function getGroupChatStats() {
  const messages = getProcessedMessages();
  const memberRows = getGroupChatMembers();

  // Step 1: Build members map per chat from chat_handle_join
  const chatMembersMap = {};
  memberRows.forEach(row => {
    if (!chatMembersMap[row.chat_identifier]) {
      chatMembersMap[row.chat_identifier] = {
        chatName: row.chat_name || null,
        members: new Set()
      };
    }
    chatMembersMap[row.chat_identifier].members.add(row.handle_id);
  });

  // For unnamed group chats, generate a name from member names
  Object.entries(chatMembersMap).forEach(([chatId, info]) => {
    if (!info.chatName) {
      const names = [...info.members]
        .map(hid => getDisplayName(hid))
        .filter(Boolean)
        .map(n => n.split(' ')[0]) // first name only
        .slice(0, 4);
      if (names.length > 0) {
        info.chatName = names.join(', ') + (info.members.size > 4 ? `, +${info.members.size - 4}` : '');
      }
    }
  });

  // Step 2: Filter to group chat messages and aggregate per chat
  const chatStats = {};

  messages.forEach(msg => {
    if (!msg.chat_identifier || !msg.chat_identifier.startsWith('chat')) return;

    const chatId = msg.chat_identifier;
    if (!chatStats[chatId]) {
      chatStats[chatId] = {
        chatIdentifier: chatId,
        chatName: chatMembersMap[chatId]?.chatName || msg.chat_name || null,
        totalMessages: 0,
        myMessages: 0,
        memberCounts: {},
        dailyFirstLast: {},
        monthlyCounts: {},
        emojis: {},
        words: {}
      };
    }
    const stat = chatStats[chatId];
    stat.totalMessages++;

    if (msg.is_from_me) {
      stat.myMessages++;
      stat.memberCounts['__me__'] = (stat.memberCounts['__me__'] || 0) + 1;
    } else {
      const hid = msg.contact_id || 'Unknown';
      stat.memberCounts[hid] = (stat.memberCounts[hid] || 0) + 1;
    }

    // Daily first/last tracking for conversation starter / last word
    if (msg.date) {
      const dateStr = toDateString(msg.date);
      const senderId = msg.is_from_me ? '__me__' : (msg.contact_id || 'Unknown');

      if (!stat.dailyFirstLast[dateStr]) {
        stat.dailyFirstLast[dateStr] = {
          first: { handleId: senderId, date: msg.date },
          last: { handleId: senderId, date: msg.date }
        };
      } else {
        const fl = stat.dailyFirstLast[dateStr];
        if (msg.date < fl.first.date) {
          fl.first = { handleId: senderId, date: msg.date };
        }
        if (msg.date >= fl.last.date) {
          fl.last = { handleId: senderId, date: msg.date };
        }
      }

      // Monthly counts
      const monthKey = `${msg.date.getFullYear()}-${String(msg.date.getMonth() + 1).padStart(2, '0')}`;
      stat.monthlyCounts[monthKey] = (stat.monthlyCounts[monthKey] || 0) + 1;
    }

    // Emoji and word extraction (skip tapback reactions)
    if (msg.text && !reactionPrefixRegex.test(msg.text)) {
      const emojis = msg.text.match(emojiRegex) || [];
      emojis.forEach(e => { stat.emojis[e] = (stat.emojis[e] || 0) + 1; });

      // Word extraction
      const wordTokens = msg.text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
      wordTokens.forEach(w => { stat.words[w] = (stat.words[w] || 0) + 1; });
    }
  });

  // Step 3: Sort by total messages (exclude chats with no displayable name)
  const sorted = Object.values(chatStats)
    .filter(s => s.chatName)
    .sort((a, b) => b.totalMessages - a.totalMessages);
  const top10 = sorted.slice(0, 10);
  const top5 = sorted.slice(0, 10);

  // Step 4: Build leaderboard
  const leaderboard = top10.map(stat => ({
    chatIdentifier: stat.chatIdentifier,
    chatName: stat.chatName,
    totalMessages: stat.totalMessages,
    memberCount: chatMembersMap[stat.chatIdentifier]?.members.size
      || Object.keys(stat.memberCounts).length,
    myMessages: stat.myMessages,
    myPercentage: Math.round((stat.myMessages / stat.totalMessages) * 1000) / 10
  }));

  // Step 5: Build personality profiles for top 10
  const resolveName = (hid) => hid === '__me__' ? 'You' : (getDisplayName(hid) || null);

  const personalities = {};
  top10.forEach(stat => {
    const entries = Object.entries(stat.memberCounts)
      .filter(([hid]) => hid !== 'Unknown')
      .map(([hid, count]) => ({ handleId: hid, name: resolveName(hid), count }))
      .filter(e => e.name)
      .sort((a, b) => b.count - a.count);

    const mostTalkative = entries[0] || null;
    const activeMembers = entries.filter(e => e.count > 0);
    const lurker = activeMembers.length > 1
      ? activeMembers[activeMembers.length - 1]
      : null;

    // Conversation starter / last word counts
    const starterCounts = {};
    const lastWordCounts = {};
    Object.values(stat.dailyFirstLast).forEach(({ first, last }) => {
      starterCounts[first.handleId] = (starterCounts[first.handleId] || 0) + 1;
      lastWordCounts[last.handleId] = (lastWordCounts[last.handleId] || 0) + 1;
    });

    const resolveTop = (counts) => {
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (!top) return null;
      return { handleId: top[0], name: resolveName(top[0]), count: top[1] };
    };

    const meEntry = entries.find(e => e.handleId === '__me__');
    const myRank = meEntry ? entries.indexOf(meEntry) + 1 : entries.length + 1;

    personalities[stat.chatIdentifier] = {
      mostTalkative: mostTalkative ? { name: mostTalkative.name, count: mostTalkative.count } : null,
      lurker: lurker ? { name: lurker.name, count: lurker.count } : null,
      conversationStarter: resolveTop(starterCounts),
      lastWord: resolveTop(lastWordCounts),
      you: {
        rank: myRank,
        count: stat.myMessages,
        percentage: Math.round((stat.myMessages / stat.totalMessages) * 1000) / 10
      }
    };
  });

  // Step 6: Build deep dive for top 5
  const deepDive = {};
  top5.forEach(stat => {
    const memberDistribution = Object.entries(stat.memberCounts)
      .filter(([hid]) => hid !== 'Unknown')
      .map(([hid, count]) => ({ name: resolveName(hid), count }))
      .filter(e => e.name)
      .sort((a, b) => b.count - a.count);

    const monthlyActivity = Object.entries(stat.monthlyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    const topEmojis = Object.entries(stat.emojis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([emoji, count]) => ({ emoji, count }));

    const topWords = Object.entries(stat.words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    deepDive[stat.chatIdentifier] = { memberDistribution, monthlyActivity, topEmojis, topWords };
  });

  return { leaderboard, personalities, deepDive };
}
