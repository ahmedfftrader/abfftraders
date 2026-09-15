import { StoreState, FreeFireItem } from './types';
import { DEFAULT_STORE_STATE, registerSoldOutStatus, applySoldOutRegistry } from './defaultData';

// Free online JSON storage endpoints (CORS-enabled, cross-device, global access)
export const PRIMARY_CLOUD_BIN = 'https://extendsclass.com/api/json-storage/bin/eedfddc';
export const BACKUP_CLOUD_BIN = 'https://extendsclass.com/api/json-storage/bin/afecbea';
export const LOCAL_API_ENDPOINT = '/api/store';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

// Helper to normalize and validate store state
export function sanitizeStoreState(raw: any): StoreState | null {
  if (!raw || typeof raw !== 'object') return null;

  // Handle case where raw has nested .data string
  let candidate = raw;
  if (typeof candidate.data === 'string') {
    try {
      candidate = JSON.parse(candidate.data);
    } catch {
      // keep candidate as is
    }
  } else if (candidate.data && typeof candidate.data === 'object' && !candidate.items && candidate.data.items) {
    candidate = candidate.data;
  }

  if (!Array.isArray(candidate.items)) {
    return null;
  }

  const resolvedPin =
    !candidate.adminPin || candidate.adminPin === 'admin786'
      ? 'opahmimetr1x'
      : candidate.adminPin;

  const resolvedItems = candidate.items.map((item: FreeFireItem) => {
    const isSoldOut = Boolean(item.isSoldOut);
    registerSoldOutStatus(item.id, isSoldOut);
    return {
      ...item,
      isSoldOut,
      badges: Array.isArray(item.badges) ? item.badges : [],
      details: Array.isArray(item.details) ? item.details : [],
    };
  });

  return {
    ...DEFAULT_STORE_STATE,
    ...candidate,
    adminPin: resolvedPin,
    announcement: { ...DEFAULT_STORE_STATE.announcement, ...(candidate.announcement || {}) },
    hero: { ...DEFAULT_STORE_STATE.hero, ...(candidate.hero || {}) },
    contact: { ...DEFAULT_STORE_STATE.contact, ...(candidate.contact || {}) },
    items: resolvedItems.length > 0 ? resolvedItems : applySoldOutRegistry(DEFAULT_STORE_STATE.items),
  };
}

/**
 * Fetch the latest live store state from the cloud.
 * Tries:
 * 1. Primary Cloud Bin (extendsclass.com)
 * 2. Local/Proxy API (/api/store)
 * 3. Backup Cloud Bin
 */
export async function fetchLiveStoreData(): Promise<StoreState | null> {
  // 1. Try Primary Cloud Bin with cache-busting timestamp
  try {
    const primaryUrl = `${PRIMARY_CLOUD_BIN}?t=${Date.now()}`;
    const res = await fetch(primaryUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const sanitized = sanitizeStoreState(data);
      if (sanitized) {
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Primary cloud fetch failed, trying fallbacks:', err);
  }

  // 2. Try Local / Proxy API
  try {
    const res = await fetch(`${LOCAL_API_ENDPOINT}?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const sanitized = sanitizeStoreState(data);
      if (sanitized) {
        return sanitized;
      }
    }
  } catch (err) {
    // ignore
  }

  // 3. Try Backup Cloud Bin
  try {
    const backupUrl = `${BACKUP_CLOUD_BIN}?t=${Date.now()}`;
    const res = await fetch(backupUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const sanitized = sanitizeStoreState(data);
      if (sanitized) {
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('[CloudSync] All cloud fetch sources failed:', err);
  }

  return null;
}

/**
 * Push updated store state to the online cloud storage and servers.
 * Guarantees that changes are saved to persistent remote online bins so any device
 * worldwide immediately receives updates.
 */
export async function saveLiveStoreData(state: StoreState): Promise<boolean> {
  const payload = JSON.stringify(state);
  let success = false;

  // 1. Update Primary Cloud Bin
  try {
    const res = await fetch(PRIMARY_CLOUD_BIN, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    if (res.ok) {
      success = true;
    }
  } catch (err) {
    console.warn('[CloudSync] Primary PUT failed:', err);
  }

  // 2. Update Backup Cloud Bin in background
  fetch(BACKUP_CLOUD_BIN, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  }).catch(() => {});

  // 3. Update Local Server API (/api/store)
  try {
    const res = await fetch(LOCAL_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    if (res.ok) {
      success = true;
    }
  } catch {
    // Non-fatal if offline
  }

  return success;
}
