const SESSION_ID_KEY = 'cf_session_id';
const SESSION_EXPIRY_KEY = 'cf_session_expiry';
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// In-memory fallback if localStorage is unavailable
let memorySessionId: string | null = null;
let memorySessionExpiry: number | null = null;

/**
 * Generate a random UUID or fallback identifier.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback generator for older browsers or non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Checks if localStorage is available and accessible.
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__cf_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves the current session ID, creating a new one or extending the active one
 * with a 30-minute rolling expiration.
 */
export function getSessionId(): string {
  const now = Date.now();
  const hasLocalStorage = isLocalStorageAvailable();

  let sessionId: string | null = null;
  let expiryTime = 0;

  if (hasLocalStorage) {
    sessionId = window.localStorage.getItem(SESSION_ID_KEY);
    const expiryStr = window.localStorage.getItem(SESSION_EXPIRY_KEY);
    expiryTime = expiryStr ? parseInt(expiryStr, 10) : 0;
  } else {
    sessionId = memorySessionId;
    expiryTime = memorySessionExpiry || 0;
  }

  // If expired or missing, regenerate session ID
  if (!sessionId || !expiryTime || now > expiryTime) {
    sessionId = generateUUID();
  }

  // Update rolling expiration time (30 minutes from now)
  const newExpiryTime = now + SESSION_DURATION_MS;

  if (hasLocalStorage) {
    try {
      window.localStorage.setItem(SESSION_ID_KEY, sessionId);
      window.localStorage.setItem(SESSION_EXPIRY_KEY, newExpiryTime.toString());
    } catch (e) {
      console.warn('CausalFunnel Tracker: Failed to write session to localStorage.', e);
    }
  } else {
    memorySessionId = sessionId;
    memorySessionExpiry = newExpiryTime;
  }

  return sessionId;
}

/**
 * Resets the session immediately.
 */
export function resetSession(): string {
  const newSessionId = generateUUID();
  const newExpiryTime = Date.now() + SESSION_DURATION_MS;

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(SESSION_ID_KEY, newSessionId);
      window.localStorage.setItem(SESSION_EXPIRY_KEY, newExpiryTime.toString());
    } catch (e) {
      console.warn('CausalFunnel Tracker: Failed to reset session in localStorage.', e);
    }
  } else {
    memorySessionId = newSessionId;
    memorySessionExpiry = newExpiryTime;
  }

  return newSessionId;
}
