import { supabase } from '../lib/supabase';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const CACHE_KEY = 'astra_cached_coords';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
let memoryCoords: { coords: GeoCoordinates; timestamp: number } | null = null;
let lastSyncTimestamp = 0;

export const LocationService = {
  /**
   * Return cached location if valid (0ms latency, zero battery/CPU overhead).
   */
  getCachedPosition(): GeoCoordinates | null {
    const now = Date.now();

    // Check memory first
    if (memoryCoords && now - memoryCoords.timestamp < CACHE_TTL_MS) {
      return memoryCoords.coords;
    }

    // Check localStorage fallback
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.coords && parsed?.timestamp && now - parsed.timestamp < CACHE_TTL_MS) {
          memoryCoords = parsed;
          return parsed.coords;
        }
      }
    } catch {
      // Ignore storage errors
    }

    return null;
  },

  /**
   * Save coordinates to cache.
   */
  setCachedPosition(coords: GeoCoordinates): void {
    const data = { coords, timestamp: Date.now() };
    memoryCoords = data;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  },

  /**
   * Request coordinates with low-power fast network triangulation (0 lag).
   * Falls back to cached position if OS takes longer than 4 seconds.
   */
  async getCurrentPosition(forceFresh = false): Promise<GeoCoordinates> {
    if (!forceFresh) {
      const cached = this.getCachedPosition();
      if (cached) return cached;
    }

    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const fallback = this.getCachedPosition();
        if (fallback) return resolve(fallback);
        reject(new Error('Geolocation is not supported by your browser or device.'));
        return;
      }

      let hasResolved = false;

      // Soft timeout fallback to avoid ever hanging the UI
      const softTimer = setTimeout(() => {
        if (!hasResolved) {
          const fallback = this.getCachedPosition();
          if (fallback) {
            hasResolved = true;
            resolve(fallback);
          }
        }
      }, 3500);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(softTimer);

          const coords: GeoCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          this.setCachedPosition(coords);
          resolve(coords);
        },
        (error) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(softTimer);

          // If we have any cached coords, use them instead of failing
          const fallback = this.getCachedPosition();
          if (fallback) {
            return resolve(fallback);
          }

          let message = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied. Please allow location access.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out.';
          }
          reject(new Error(message));
        },
        {
          // Crucial for 60fps performance: false uses cell towers/Wi-Fi (~15ms)
          // instead of turning on GPS satellite chip (5-10s UI freeze)
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: CACHE_TTL_MS
        }
      );
    });
  },

  /**
   * Debounced sync coordinates to Supabase (maximum once per 10 minutes).
   */
  async syncUserLocation(coords: GeoCoordinates, city?: string): Promise<boolean> {
    const now = Date.now();
    // Debounce to once every 10 minutes to save DB roundtrips and CPU
    if (now - lastSyncTimestamp < 10 * 60 * 1000) {
      return true;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return false;

      lastSyncTimestamp = now;

      const { error: rpcError } = await supabase.rpc('update_user_location', {
        p_latitude: coords.latitude,
        p_longitude: coords.longitude,
        p_city: city || null
      });

      if (rpcError) {
        await supabase
          .from('profiles')
          .update({
            current_latitude: coords.latitude,
            current_longitude: coords.longitude,
            location_city: city || undefined,
            last_location_at: new Date().toISOString()
          })
          .eq('id', userId);
      }

      return true;
    } catch (err) {
      console.error('[LocationService] Failed to sync user location:', err);
      return false;
    }
  },

  /**
   * Compute distance between two coordinates in kilometers using Haversine formula.
   */
  haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
};
