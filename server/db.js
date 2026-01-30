import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';

const DB_PATH = join(homedir(), 'Library', 'Messages', 'chat.db');
const CONTACTS_DIR = join(homedir(), 'Library', 'Application Support', 'AddressBook', 'Sources');

let db = null;
let contactsMap = null;

export function getDatabase() {
  if (db) return db;

  if (!existsSync(DB_PATH)) {
    throw new Error(
      'iMessage database not found. Make sure you are on macOS and have iMessage enabled.'
    );
  }

  try {
    db = new Database(DB_PATH, { readonly: true });
    return db;
  } catch (error) {
    if (error.code === 'SQLITE_CANTOPEN') {
      throw new Error(
        'Cannot access iMessage database. Please grant Full Disk Access to Terminal:\n' +
        'System Preferences > Security & Privacy > Privacy > Full Disk Access'
      );
    }
    throw error;
  }
}

// Load contacts from AddressBook database
function loadContactsMap() {
  if (contactsMap) return contactsMap;
  contactsMap = new Map();

  if (!existsSync(CONTACTS_DIR)) {
    console.log('AddressBook directory not found');
    return contactsMap;
  }

  try {
    // Find all AddressBook databases (there can be multiple sources)
    const sources = readdirSync(CONTACTS_DIR);

    for (const source of sources) {
      const dbPath = join(CONTACTS_DIR, source, 'AddressBook-v22.abcddb');
      if (!existsSync(dbPath)) continue;

      try {
        const contactsDb = new Database(dbPath, { readonly: true });

        // Get phone numbers with associated names
        const phoneQuery = `
          SELECT
            ZABCDRECORD.ZFIRSTNAME,
            ZABCDRECORD.ZLASTNAME,
            ZABCDPHONENUMBER.ZFULLNUMBER
          FROM ZABCDRECORD
          LEFT JOIN ZABCDPHONENUMBER ON ZABCDRECORD.Z_PK = ZABCDPHONENUMBER.ZOWNER
          WHERE ZABCDPHONENUMBER.ZFULLNUMBER IS NOT NULL
        `;

        const phones = contactsDb.prepare(phoneQuery).all();
        for (const row of phones) {
          const name = [row.ZFIRSTNAME, row.ZLASTNAME].filter(Boolean).join(' ');
          if (name && row.ZFULLNUMBER) {
            // Normalize phone number (remove spaces, dashes, parentheses)
            const normalized = normalizePhone(row.ZFULLNUMBER);
            contactsMap.set(normalized, name);
          }
        }

        // Get email addresses with associated names
        const emailQuery = `
          SELECT
            ZABCDRECORD.ZFIRSTNAME,
            ZABCDRECORD.ZLASTNAME,
            ZABCDEMAILADDRESS.ZADDRESS
          FROM ZABCDRECORD
          LEFT JOIN ZABCDEMAILADDRESS ON ZABCDRECORD.Z_PK = ZABCDEMAILADDRESS.ZOWNER
          WHERE ZABCDEMAILADDRESS.ZADDRESS IS NOT NULL
        `;

        const emails = contactsDb.prepare(emailQuery).all();
        for (const row of emails) {
          const name = [row.ZFIRSTNAME, row.ZLASTNAME].filter(Boolean).join(' ');
          if (name && row.ZADDRESS) {
            contactsMap.set(row.ZADDRESS.toLowerCase(), name);
          }
        }

        contactsDb.close();
      } catch (err) {
        console.log(`Could not read contacts from ${source}:`, err.message);
      }
    }
  } catch (err) {
    console.log('Error loading contacts:', err.message);
  }

  console.log(`Loaded ${contactsMap.size} contacts`);
  return contactsMap;
}

// Normalize phone number for matching
function normalizePhone(phone) {
  // Remove all non-digit characters except leading +
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');
  return hasPlus ? '+' + digits : digits;
}

// Get contact name from phone/email
export function getContactName(identifier) {
  if (!identifier) return null;
  const contacts = loadContactsMap();

  // Try direct match first
  if (contacts.has(identifier)) {
    return contacts.get(identifier);
  }

  // Try normalized phone match
  const normalized = normalizePhone(identifier);
  if (contacts.has(normalized)) {
    return contacts.get(normalized);
  }

  // Try without country code (for US numbers)
  if (normalized.startsWith('+1') && normalized.length === 12) {
    const withoutCountry = normalized.slice(2);
    if (contacts.has(withoutCountry)) {
      return contacts.get(withoutCountry);
    }
  }

  // Try adding +1 for 10-digit numbers
  if (normalized.length === 10) {
    const withCountry = '+1' + normalized;
    if (contacts.has(withCountry)) {
      return contacts.get(withCountry);
    }
  }

  // Try email lowercase match
  if (identifier.includes('@')) {
    const lowerEmail = identifier.toLowerCase();
    if (contacts.has(lowerEmail)) {
      return contacts.get(lowerEmail);
    }
  }

  return null;
}

// Helper to convert Apple's CoreData timestamp to JS Date
// Apple stores dates as seconds since 2001-01-01
export function appleTimestampToDate(timestamp) {
  if (!timestamp) return null;
  // Apple epoch is 978307200 seconds after Unix epoch
  const appleEpoch = 978307200;
  // Timestamps might be in nanoseconds
  const seconds = timestamp > 1e12 ? timestamp / 1e9 : timestamp;
  return new Date((seconds + appleEpoch) * 1000);
}

// Get all messages
export function getMessages2025() {
  const db = getDatabase();

  const query = `
    SELECT
      m.ROWID as id,
      m.text,
      m.date,
      m.is_from_me,
      m.handle_id,
      h.id as contact_id,
      c.chat_identifier,
      c.display_name as chat_name
    FROM message m
    LEFT JOIN handle h ON m.handle_id = h.ROWID
    LEFT JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    LEFT JOIN chat c ON cmj.chat_id = c.ROWID
    ORDER BY m.date ASC
  `;

  return db.prepare(query).all();
}

// Get all handles (contacts)
export function getHandles() {
  const db = getDatabase();
  return db.prepare('SELECT ROWID, id, service FROM handle').all();
}

// Get sticker messages with schema-adaptive detection
export function getStickerMessages() {
  const db = getDatabase();

  // Detect available columns via PRAGMA
  const attachmentCols = db.prepare('PRAGMA table_info(attachment)').all().map(c => c.name);
  const messageCols = db.prepare('PRAGMA table_info(message)').all().map(c => c.name);

  const hasIsSticker = attachmentCols.includes('is_sticker');
  const hasBalloonBundleId = messageCols.includes('balloon_bundle_id');
  const hasAssociatedMessageType = messageCols.includes('associated_message_type');

  // Build WHERE conditions for sticker detection (layered, OR'd)
  const conditions = [];
  if (hasIsSticker) conditions.push('a.is_sticker = 1');
  if (hasBalloonBundleId) conditions.push("m.balloon_bundle_id LIKE 'com.apple.messages.MSMessageExtensionBalloonPlugin:%'");
  if (hasAssociatedMessageType) conditions.push('m.associated_message_type = 1000');
  conditions.push("a.uti = 'com.apple.sticker'");

  const whereClause = conditions.join(' OR ');

  const balloonSelect = hasBalloonBundleId ? 'm.balloon_bundle_id' : "NULL as balloon_bundle_id";

  const query = `
    SELECT
      a.ROWID as attachment_id,
      a.filename,
      a.transfer_name,
      a.uti,
      a.mime_type,
      m.date,
      m.is_from_me,
      m.handle_id,
      h.id as contact_id,
      ${balloonSelect}
    FROM attachment a
    JOIN message_attachment_join maj ON a.ROWID = maj.attachment_id
    JOIN message m ON maj.message_id = m.ROWID
    LEFT JOIN handle h ON m.handle_id = h.ROWID
    LEFT JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    LEFT JOIN chat c ON cmj.chat_id = c.ROWID
    WHERE ${whereClause}
    ORDER BY m.date ASC
  `;

  return db.prepare(query).all();
}

// Test database connection
export function testConnection() {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM message').get();
    return { success: true, messageCount: result.count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
