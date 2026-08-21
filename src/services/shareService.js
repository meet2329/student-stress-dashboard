/**
 * Share Service
 * Manages creation, retrieval, validation, expiration, and revocation of temporary shareable dashboard links.
 * Backed by Cloud Firestore with automatic LocalStorage synchronization and fallback.
 */

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION_NAME = 'shared_dashboards'
const LOCAL_STORAGE_KEY = 'student_stress_shared_dashboards'

// Helper: Generate a sleek short alphanumeric ID (e.g. dash_k8x9m2)
export function generateShareId() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `dash_${id}`
}

// Helper: Get local storage fallback list
function getLocalShares() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Helper: Save to local storage fallback list
function saveLocalShare(shareObj) {
  try {
    const all = getLocalShares()
    all[shareObj.id] = shareObj
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('LocalStorage quota or access warning:', e)
  }
}

// Helper: Remove from local storage
function removeLocalShare(shareId) {
  try {
    const all = getLocalShares()
    delete all[shareId]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('LocalStorage removal warning:', e)
  }
}

/**
 * Expiration duration presets in milliseconds
 */
export const EXPIRATION_PRESETS = [
  { id: '1h', label: '1 Hour', durationMs: 1 * 60 * 60 * 1000, description: 'Quick review / live meeting' },
  { id: '6h', label: '6 Hours', durationMs: 6 * 60 * 60 * 1000, description: 'Same-day collaboration' },
  { id: '24h', label: '24 Hours (1 Day)', durationMs: 24 * 60 * 60 * 1000, description: 'Standard temporary share' },
  { id: '7d', label: '7 Days', durationMs: 7 * 24 * 60 * 60 * 1000, description: 'Assignment or team review' },
  { id: '30d', label: '30 Days', durationMs: 30 * 24 * 60 * 60 * 1000, description: 'Extended evaluation' },
  { id: 'never', label: 'Permanent', durationMs: null, description: 'Does not expire automatically' },
]

// Helper: UTF-8 safe Base64 URL Encoder
export function encodePayloadToUrl(data) {
  try {
    const json = JSON.stringify(data)
    const utf8Bytes = new TextEncoder().encode(json)
    let binary = ''
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i])
    }
    return encodeURIComponent(btoa(binary))
  } catch (e) {
    console.warn('URL payload encode notice:', e)
    return ''
  }
}

// Helper: UTF-8 safe Base64 URL Decoder
export function decodePayloadFromUrl(encodedStr) {
  try {
    if (!encodedStr) return null
    let raw = encodedStr.trim()
    if (raw.startsWith('#')) raw = raw.slice(1)
    if (raw.startsWith('?')) raw = raw.slice(1)
    if (raw.startsWith('d=')) raw = raw.slice(2)
    if (raw.includes('d=')) {
      try {
        const params = new URLSearchParams(raw)
        const dVal = params.get('d')
        if (dVal) raw = dVal
      } catch {}
    }
    const decodedUri = decodeURIComponent(raw)
    const binary = atob(decodedUri)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json)
  } catch (e) {
    console.warn('URL payload decode notice:', e)
    return null
  }
}

/**
 * Creates a temporary shareable dashboard snapshot.
 * 
 * @param {Object} params
 * @param {string} params.title - Custom title for the dashboard
 * @param {string} params.description - Optional note or description
 * @param {string} params.type - 'student_stress' | 'ai_eda'
 * @param {string} params.durationId - '1h' | '6h' | '24h' | '7d' | '30d' | 'never'
 * @param {string} [params.pin] - Optional 4-digit PIN for protection
 * @param {Object} params.state - Complete snapshot payload (filters, customDataset, charts, etc.)
 * @param {Object} [params.user] - Creator auth details
 * @returns {Promise<{ shareId: string, shareUrl: string, expiresAt: number|null, durationLabel: string, payload: Object }>}
 */
export async function createShareLink({
  title = 'Interactive Dashboard Snapshot',
  description = '',
  type = 'student_stress',
  durationId = '24h',
  pin = '',
  state = {},
  user = null
}) {
  const shareId = generateShareId()
  const now = Date.now()
  const preset = EXPIRATION_PRESETS.find(p => p.id === durationId) || EXPIRATION_PRESETS[2]
  const expiresAt = preset.durationMs ? now + preset.durationMs : null

  const cleanState = sanitizeStatePayload(state)

  const sharePayload = {
    id: shareId,
    title: title.trim() || 'Shared Dashboard',
    description: description.trim(),
    type,
    durationId,
    durationLabel: preset.label,
    createdAt: now,
    expiresAt,
    isRevoked: false,
    viewCount: 0,
    hasPin: Boolean(pin && pin.trim().length >= 4),
    pin: pin && pin.trim().length >= 4 ? pin.trim() : null,
    owner: {
      uid: user?.uid || 'anonymous',
      displayName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous Analyst',
      email: user?.email || null,
      photoURL: user?.photoURL || null
    },
    state: cleanState
  }

  // 1. Always save to LocalStorage for instant creator management & local testing
  saveLocalShare(sharePayload)

  // 2. Save to Cloud Firestore Database
  let firestoreSaved = false
  if (db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, shareId)
      await setDoc(docRef, {
        ...sharePayload,
        serverCreatedAt: serverTimestamp()
      })
      firestoreSaved = true
    } catch (firestoreErr) {
      console.warn('Firestore share creation warning:', firestoreErr.message)
    }
  }

  // 3. Generate robust URL with embedded encoded state hash
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const encodedHash = encodePayloadToUrl(sharePayload)
  const shareUrl = `${origin}/share/${shareId}#d=${encodedHash}`

  return {
    shareId,
    shareUrl,
    shortShareUrl: `${origin}/share/${shareId}`,
    expiresAt,
    durationLabel: preset.label,
    payload: sharePayload,
    firestoreSaved
  }
}

/**
 * Retrieves and validates a shared dashboard by its unique share ID and optional hash payload.
 * 
 * @param {string} shareId 
 * @param {string} [hashPayload]
 * @returns {Promise<{ success: boolean, data?: Object, isExpired?: boolean, isRevoked?: boolean, requiresPin?: boolean, error?: string }>}
 */
export async function getSharedDashboard(shareId, hashPayload = '') {
  if (!shareId) {
    return { success: false, error: 'Invalid share link ID.' }
  }

  let record = null

  // 1. First attempt: Firestore Database
  if (db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, shareId)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        record = snap.data()
      }
    } catch (e) {
      console.warn('Firestore fetch notice:', e.message)
    }
  }

  // 2. Second attempt: Embedded URL Hash or Search Payload
  if (!record) {
    const rawHash = hashPayload || (typeof window !== 'undefined' ? (window.location.hash || window.location.search) : '')
    if (rawHash) {
      const parsedFromHash = decodePayloadFromUrl(rawHash)
      if (parsedFromHash && (parsedFromHash.id === shareId || parsedFromHash.state)) {
        record = parsedFromHash
      }
    }
  }

  // 3. Third attempt: LocalStorage
  if (!record) {
    const localShares = getLocalShares()
    record = localShares[shareId] || null
  }

  if (!record) {
    return {
      success: false,
      error: 'Dashboard not found. The link may be incorrect, corrupted, or deleted.'
    }
  }

  // 3. Check if manually revoked
  if (record.isRevoked) {
    return {
      success: false,
      isRevoked: true,
      data: record,
      error: 'This shared link has been revoked by the owner.'
    }
  }

  // 4. Check if expired
  const now = Date.now()
  if (record.expiresAt && now > record.expiresAt) {
    return {
      success: false,
      isExpired: true,
      data: record,
      error: `This temporary link expired on ${new Date(record.expiresAt).toLocaleString()}.`
    }
  }

  // 5. Asynchronously increment view count in Firestore and local storage
  recordViewCount(shareId).catch(() => {})

  return {
    success: true,
    data: record,
    isExpired: false,
    isRevoked: false,
    requiresPin: Boolean(record.hasPin)
  }
}

/**
 * Increments view count for a dashboard.
 */
async function recordViewCount(shareId) {
  try {
    // Update local storage
    const all = getLocalShares()
    if (all[shareId]) {
      all[shareId].viewCount = (all[shareId].viewCount || 0) + 1
      all[shareId].lastViewedAt = Date.now()
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all))
    }

    // Update Firestore
    if (db) {
      const docRef = doc(db, COLLECTION_NAME, shareId)
      await updateDoc(docRef, {
        viewCount: increment(1),
        lastViewedAt: Date.now()
      })
    }
  } catch {
    // Non-critical, ignore errors
  }
}

/**
 * Revokes or deletes a shared link immediately.
 */
export async function revokeShareLink(shareId) {
  try {
    // 1. Update local storage
    const all = getLocalShares()
    if (all[shareId]) {
      all[shareId].isRevoked = true
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all))
    }

    // 2. Update Firestore
    if (db) {
      const docRef = doc(db, COLLECTION_NAME, shareId)
      await updateDoc(docRef, {
        isRevoked: true,
        revokedAt: Date.now()
      })
    }

    return { success: true }
  } catch (err) {
    console.error('Failed to revoke share link:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Retrieves all shared links created locally or by the current user.
 */
export async function getUserSharedLinks(userUid = null) {
  const localList = Object.values(getLocalShares())
  const linksMap = new Map()

  // Add local links first
  localList.forEach(item => {
    if (!userUid || item.owner?.uid === userUid || item.owner?.uid === 'anonymous') {
      linksMap.set(item.id, item)
    }
  })

  // Fetch Firestore links if authenticated and db is ready
  if (db && userUid && userUid !== 'anonymous') {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('owner.uid', '==', userUid)
      )
      const snap = await getDocs(q)
      snap.forEach(docSnap => {
        const d = docSnap.data()
        linksMap.set(d.id, d)
      })
    } catch (e) {
      console.warn('Firestore user links fetch note:', e.message)
    }
  }

  // Sort by createdAt descending
  return Array.from(linksMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

/**
 * Helper to calculate human-readable remaining time
 */
export function formatTimeRemaining(expiresAt) {
  if (!expiresAt) return { text: 'Permanent (No Expiry)', isExpired: false, isUrgent: false }
  
  const diff = expiresAt - Date.now()
  if (diff <= 0) return { text: 'Expired', isExpired: true, isUrgent: false }

  const seconds = Math.floor((diff / 1000) % 60)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  let text = ''
  if (days > 0) {
    text = `${days}d ${hours}h left`
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m left`
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s left`
  } else {
    text = `${seconds}s left`
  }

  const isUrgent = diff < 15 * 60 * 1000 // less than 15 mins

  return { text, isExpired: false, isUrgent, diff }
}

/**
 * Clean & prune oversized state before sharing, ensuring no undefined values reach Firestore (< 50KB total size)
 */
function sanitizeStatePayload(state) {
  if (!state) return {}
  try {
    const jsonString = JSON.stringify(state, (key, value) => {
      if (value === undefined) return null
      return value
    })
    const copy = JSON.parse(jsonString)
    
    // Sample rawDataset.rows to max 250 rows for fast & lightweight Cloud storage (<50KB)
    if (copy.rawDataset && Array.isArray(copy.rawDataset.rows) && copy.rawDataset.rows.length > 250) {
      copy.rawDataset.rows = copy.rawDataset.rows.slice(0, 250)
      copy.rawDataset.isSampled = true
    }

    // Sample analysisData.rows to max 250 rows
    if (copy.analysisData && Array.isArray(copy.analysisData.rows) && copy.analysisData.rows.length > 250) {
      copy.analysisData.rows = copy.analysisData.rows.slice(0, 250)
      copy.analysisData.isSampled = true
    }

    return copy
  } catch {
    return {}
  }
}
