import { useState, useEffect, useRef, useCallback } from 'react';
import { StoreState, FreeFireItem, AnnouncementConfig, ContactConfig, HeroConfig } from './types';
import { DEFAULT_STORE_STATE, getFallbackStoreState, registerSoldOutStatus, applySoldOutRegistry } from './defaultData';
import { fetchLiveStoreData, saveLiveStoreData } from './cloudSync';
import { withImageCacheBuster } from './utils/imageUtils';
import { scheduleAsyncStorageWrite, getStoredItemOrPending } from './utils/asyncStorage';

const STORAGE_KEY = 'ahmed_bhai_ff_store_v3';
const SYNC_CHANNEL_NAME = 'ahmed_bhai_ff_store_sync_v3';

// Quick fingerprint generator to detect actual store changes
const getStoreFingerprint = (s: StoreState | null | undefined): string => {
  if (!s) return '';
  try {
    return JSON.stringify({
      ann: s.announcement?.text,
      annEn: s.announcement?.enabled,
      items: s.items?.map((i) => `${i.id}:${Boolean(i.isSoldOut)}:${i.price}:${i.title}:${i.level}:${i.originalPrice}:${i.imageUrl}`),
      contact: `${s.contact?.whatsappNumber}:${s.contact?.paymentNumber}`,
      hero: s.hero?.headingLine1,
      pin: s.adminPin,
    });
  } catch {
    return '';
  }
};

export function useStoreState() {
  const [state, setState] = useState<StoreState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const resolvedPin =
          !parsed.adminPin || parsed.adminPin === 'admin786'
            ? 'opahmimetr1x'
            : parsed.adminPin;

        const resolvedItems = Array.isArray(parsed.items) && parsed.items.length > 0
          ? parsed.items.map((item: FreeFireItem) => {
              const isSoldOut = Boolean(item.isSoldOut);
              registerSoldOutStatus(item.id, isSoldOut);
              return { ...item, isSoldOut };
            })
          : applySoldOutRegistry(DEFAULT_STORE_STATE.items);

        return {
          ...DEFAULT_STORE_STATE,
          ...parsed,
          adminPin: resolvedPin,
          announcement: { ...DEFAULT_STORE_STATE.announcement, ...(parsed.announcement || {}) },
          hero: { ...DEFAULT_STORE_STATE.hero, ...(parsed.hero || {}) },
          contact: { ...DEFAULT_STORE_STATE.contact, ...(parsed.contact || {}) },
          items: resolvedItems,
        };
      }
    } catch (e) {
      console.error('Error loading store state from local cache:', e);
    }
    return getFallbackStoreState();
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const stateRef = useRef<StoreState>(state);
  stateRef.current = state;

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isSyncingRef = useRef<boolean>(false);
  const cloudDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocalActionTimeRef = useRef<number>(0);

  // Synchronous local persistence & background non-blocking cloud synchronization
  const persistAndSync = useCallback((nextState: StoreState, immediateCloudSync: boolean = false) => {
    lastLocalActionTimeRef.current = Date.now();

    // 1. Non-blocking debounced local storage write (300ms, requestIdleCallback)
    scheduleAsyncStorageWrite(STORAGE_KEY, nextState, 300);

    // 2. Register sold-out items in fallback registry
    if (Array.isArray(nextState.items)) {
      for (const item of nextState.items) {
        registerSoldOutStatus(item.id, Boolean(item.isSoldOut));
      }
    }

    // 3. Instant local cross-tab broadcast (non-blocking)
    try {
      broadcastChannelRef.current?.postMessage({
        type: 'STORE_SYNC_EVENT',
        state: nextState,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 4. Non-blocking cloud synchronization (strictly queued in background, never blocks UI thread)
    if (cloudDebounceTimerRef.current) {
      clearTimeout(cloudDebounceTimerRef.current);
      cloudDebounceTimerRef.current = null;
    }

    const pushToCloud = () => {
      saveLiveStoreData(nextState)
        .then((ok) => {
          if (ok) {
            setIsCloudSynced(true);
            setLastSyncedAt(Date.now());
          }
        })
        .catch(() => {});
    };

    // Ensure state action executes in < 5ms synchronously without waiting for network or serialization
    const delay = immediateCloudSync ? 80 : 350;
    cloudDebounceTimerRef.current = setTimeout(pushToCloud, delay);
  }, []);

  // Fetch live store data from Cloud with safety guards
  const syncFromCloud = useCallback(async () => {
    // If local admin action was performed within last 4.5 seconds, don't overwrite with remote poll
    if (Date.now() - lastLocalActionTimeRef.current < 4500) {
      return;
    }
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      const cloudData = await fetchLiveStoreData();
      if (!cloudData) {
        isSyncingRef.current = false;
        return;
      }

      // Re-check after network response finishes
      if (Date.now() - lastLocalActionTimeRef.current < 4500) {
        isSyncingRef.current = false;
        return;
      }

      const currentFingerprint = getStoreFingerprint(stateRef.current);
      const cloudFingerprint = getStoreFingerprint(cloudData);

      if (cloudFingerprint && cloudFingerprint !== currentFingerprint) {
        setState(cloudData);
        stateRef.current = cloudData;
        scheduleAsyncStorageWrite(STORAGE_KEY, cloudData, 300);
        setIsCloudSynced(true);
        setLastSyncedAt(Date.now());
      } else {
        setIsCloudSynced(true);
      }
    } catch (err) {
      console.warn('[Store] Cloud sync error:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // 1. Initial live sync from cloud storage on mount
    syncFromCloud();

    // 2. Setup BroadcastChannel for real-time local tab syncing
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        broadcastChannelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data?.state) {
            const incomingState = event.data.state as StoreState;
            if (getStoreFingerprint(incomingState) !== getStoreFingerprint(stateRef.current)) {
              setState(incomingState);
              stateRef.current = incomingState;
            }
          }
        };
      } catch (e) {
        console.warn('Could not initialize BroadcastChannel:', e);
      }
    }

    // 3. Storage event for cross-tab sync in older browsers
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (getStoreFingerprint(parsed) !== getStoreFingerprint(stateRef.current)) {
            setState(parsed);
            stateRef.current = parsed;
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 4. Refresh when user returns to/focuses the tab
    const handleFocus = () => {
      syncFromCloud();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFromCloud();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Periodic poll for visitors so other devices see updates live without refreshing
    const pollInterval = setInterval(() => {
      // If admin is active in this tab, pause background polling to guarantee 0ms UI reactivity
      const isAdminLoggedIn = sessionStorage.getItem('ahmed_bhai_admin_auth') === 'true';
      if (isAdminLoggedIn) {
        return;
      }
      syncFromCloud();
    }, 4000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pollInterval);
      if (cloudDebounceTimerRef.current) {
        clearTimeout(cloudDebounceTimerRef.current);
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [syncFromCloud]);

  // --- ACTIONS (Optimistic, Synchronous, Instant) ---

  const updateAnnouncement = (announcement: AnnouncementConfig) => {
    const next: StoreState = { ...stateRef.current, announcement };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, false);
  };

  const updateHero = (hero: HeroConfig) => {
    const next: StoreState = { ...stateRef.current, hero };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, false);
  };

  const updateContact = (contact: ContactConfig) => {
    const next: StoreState = { ...stateRef.current, contact };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, false);
  };

  const addItem = (itemData: Omit<FreeFireItem, 'id' | 'createdAt'>) => {
    const now = Date.now();
    const finalImageUrl = withImageCacheBuster(itemData.imageUrl, now);
    const newItem: FreeFireItem = {
      ...itemData,
      imageUrl: finalImageUrl,
      id: 'ff-item-' + now,
      createdAt: now,
      isSoldOut: Boolean(itemData.isSoldOut),
    };
    registerSoldOutStatus(newItem.id, newItem.isSoldOut);

    const next: StoreState = {
      ...stateRef.current,
      items: [newItem, ...stateRef.current.items],
    };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, true);
  };

  const updateItem = (id: string, updated: Partial<FreeFireItem>) => {
    const now = Date.now();
    let processedUpdated = { ...updated };
    if (updated.imageUrl) {
      processedUpdated.imageUrl = withImageCacheBuster(updated.imageUrl, now);
    }

    const nextItems = stateRef.current.items.map((item) => {
      if (item.id === id) {
        const merged = { ...item, ...processedUpdated };
        if (processedUpdated.isSoldOut !== undefined) {
          registerSoldOutStatus(id, Boolean(processedUpdated.isSoldOut));
        }
        return merged;
      }
      return item;
    });

    const next: StoreState = { ...stateRef.current, items: nextItems };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, true);
  };

  const deleteItem = (id: string) => {
    const next: StoreState = {
      ...stateRef.current,
      items: stateRef.current.items.filter((item) => item.id !== id),
    };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, true);
  };

  const toggleSoldOut = (id: string) => {
    let nextStatus = false;
    const nextItems = stateRef.current.items.map((item) => {
      if (item.id === id) {
        nextStatus = !item.isSoldOut;
        registerSoldOutStatus(id, nextStatus);
        return { ...item, isSoldOut: nextStatus };
      }
      return item;
    });

    const next: StoreState = { ...stateRef.current, items: nextItems };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, true);
  };

  const quickUpdateItemPrice = (id: string, price: string, originalPrice?: string) => {
    const nextItems = stateRef.current.items.map((item) => {
      if (item.id === id) {
        return { ...item, price, originalPrice: originalPrice ?? item.originalPrice };
      }
      return item;
    });
    const next: StoreState = { ...stateRef.current, items: nextItems };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, true);
  };

  const quickUpdateItemTitle = (id: string, title: string) => {
    const nextItems = stateRef.current.items.map((item) => {
      if (item.id === id) {
        return { ...item, title };
      }
      return item;
    });
    const next: StoreState = { ...stateRef.current, items: nextItems };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, false);
  };

  const quickUpdateItemImage = (id: string, imageUrl: string) => {
    const now = Date.now();
    const finalImageUrl = withImageCacheBuster(imageUrl, now);
    const nextItems = stateRef.current.items.map((item) => {
      if (item.id === id) {
        return { ...item, imageUrl: finalImageUrl };
      }
      return item;
    });
    const next: StoreState = { ...stateRef.current, items: nextItems };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, false);
  };

  const updateAdminPin = (newPin: string) => {
    const next: StoreState = { ...stateRef.current, adminPin: newPin };
    stateRef.current = next;
    setState(next);
    persistAndSync(next, true);
  };

  const resetToDefault = () => {
    const fresh = getFallbackStoreState();
    stateRef.current = fresh;
    setState(fresh);
    persistAndSync(fresh, true);
  };

  const importData = (imported: StoreState) => {
    const fresh: StoreState = {
      ...DEFAULT_STORE_STATE,
      ...imported,
      items: Array.isArray(imported.items)
        ? imported.items.map((i) => {
            const isSoldOut = Boolean(i.isSoldOut);
            registerSoldOutStatus(i.id, isSoldOut);
            return { ...i, isSoldOut };
          })
        : DEFAULT_STORE_STATE.items,
    };
    stateRef.current = fresh;
    setState(fresh);
    persistAndSync(fresh, true);
  };

  return {
    state,
    isCloudSynced,
    lastSyncedAt,
    syncFromCloud,
    updateAnnouncement,
    updateHero,
    updateContact,
    addItem,
    updateItem,
    deleteItem,
    toggleSoldOut,
    quickUpdateItemPrice,
    quickUpdateItemTitle,
    quickUpdateItemImage,
    updateAdminPin,
    resetToDefault,
    importData,
  };
}
