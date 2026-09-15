import { supabase } from '../lib/supabase';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const LocationService = {
  /**
   * Request user's current GPS coordinates from the device / browser.
   */
  async getCurrentPosition(): Promise<GeoCoordinates> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by your browser or device.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied. Please allow location access to discover nearby matches.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out. Please try again.';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  /**
   * Sync coordinates to the current user's profile in Supabase.
   */
  async syncUserLocation(coords: GeoCoordinates, city?: string): Promise<boolean> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return false;

      const { error: rpcError } = await supabase.rpc('update_user_location', {
        p_latitude: coords.latitude,
        p_longitude: coords.longitude,
        p_city: city || null
      });

      if (rpcError) {
        console.warn('[LocationService] update_user_location RPC error, falling back to direct update:', rpcError);
        const { error: directError } = await supabase
          .from('profiles')
          .update({
            current_latitude: coords.latitude,
            current_longitude: coords.longitude,
            location_city: city || undefined,
            last_location_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (directError) throw directError;
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
