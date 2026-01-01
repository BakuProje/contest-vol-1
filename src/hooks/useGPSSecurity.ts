import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GPSSecurityResult {
  isLocationAllowed: boolean;
  isLoading: boolean;
  error: string | null;
  duplicateUser: string | null;
  currentLocation: LocationData | null;
  recheckLocation: () => Promise<void>;
  accuracy: number | null;
}

interface ExistingRegistration {
  id: string;
  full_name: string;
  latitude: number;
  longitude: number;
}

// Type guard for GeolocationPosition
function isGeolocationPosition(position: any): position is GeolocationPosition {
  return position && 
         position.coords && 
         typeof position.coords.latitude === 'number' &&
         typeof position.coords.longitude === 'number' &&
         typeof position.coords.accuracy === 'number';
}

export function useGPSSecurity(): GPSSecurityResult {
  const [isLocationAllowed, setIsLocationAllowed] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [duplicateUser, setDuplicateUser] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [existingRegistrations, setExistingRegistrations] = useState<ExistingRegistration[]>([]);
  
  // Use ref to track if we're already checking to prevent multiple simultaneous checks
  const isCheckingRef = useRef(false);
  const lastCheckTimeRef = useRef<number>(0);
  const lastLocationRef = useRef<LocationData | null>(null);
  const hasShownDuplicateRef = useRef(false);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2 - lat1) * Math.PI/180;
    const Δλ = (lon2 - lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  }, []);

  // Fetch existing registrations from database
  const fetchExistingRegistrations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, full_name, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching registrations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchExistingRegistrations:', error);
      return [];
    }
  }, []);

  // Check if current location conflicts with existing registrations
  const checkLocationSecurity = useCallback(async (location: LocationData) => {
    if (isCheckingRef.current) {
      return; // Prevent multiple simultaneous checks
    }

    // Throttle checks - don't check more than once every 5 seconds
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 5000) {
      return;
    }

    // Check if location changed significantly (more than 10 meters) to avoid unnecessary checks
    if (lastLocationRef.current) {
      const distance = calculateDistance(
        lastLocationRef.current.latitude,
        lastLocationRef.current.longitude,
        location.latitude,
        location.longitude
      );
      if (distance < 10) {
        return; // Location hasn't changed significantly
      }
    }

    isCheckingRef.current = true;
    lastCheckTimeRef.current = now;
    lastLocationRef.current = location;

    try {
      // Fetch fresh data from database
      const registrations = await fetchExistingRegistrations();

      // Check for location conflicts with reasonable threshold (100 meters)
      const locationThreshold = 100;
      
      for (const registration of registrations) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          registration.latitude,
          registration.longitude
        );

        if (distance < locationThreshold) {
          setDuplicateUser(registration.full_name);
          setError(`Lokasi terlalu dekat dengan pendaftar lain (${registration.full_name}). Jarak: ${Math.round(distance)}m`);
          hasShownDuplicateRef.current = true;
          // Don't block registration, just warn
          setIsLocationAllowed(true);
          return;
        }
      }

      // If we get here, location is clear
      setDuplicateUser(null);
      if (!error || error.includes('Lokasi terlalu dekat')) {
        setError(null);
      }
      hasShownDuplicateRef.current = false;

    } catch (error) {
      console.log('Error checking location security:', error);
      // Don't block registration on error
      setIsLocationAllowed(true);
    } finally {
      isCheckingRef.current = false;
      setIsLoading(false);
    }
  }, [calculateDistance, fetchExistingRegistrations, error]);

  // Get current location and check security
  const getCurrentLocationAndCheck = useCallback(async () => {
    console.log('🔍 Starting GPS location check...');
    
    if (!navigator.geolocation) {
      console.log('❌ Geolocation not supported');
      setError('Geolocation tidak didukung oleh browser ini');
      setIsLocationAllowed(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📍 Requesting location...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Location request timeout'));
        }, 15000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            console.log('✅ Location received:', pos.coords);
            if (isGeolocationPosition(pos)) {
              resolve(pos);
            } else {
              reject(new Error('Invalid geolocation position'));
            }
          },
          (error) => {
            clearTimeout(timeoutId);
            console.log('❌ Location error:', error.code, error.message);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      console.log('📍 Location data:', locationData);
      setCurrentLocation(locationData);
      
      // Always allow location but check for duplicates
      setIsLocationAllowed(true);
      setIsLoading(false);
      
      // Check security for this location (but don't block)
      await checkLocationSecurity(locationData);

    } catch (error: any) {
      console.log('❌ GPS Error:', error);
      
      let errorMessage = 'Gagal mendapatkan lokasi';
      
      if (error.code === 1) {
        errorMessage = 'Mohon izinkan akses lokasi untuk melanjutkan pendaftaran.';
        setIsLocationAllowed(false);
      } else if (error.code === 2) {
        errorMessage = 'Tidak dapat mendeteksi lokasi. Pastikan GPS aktif.';
        setIsLocationAllowed(true); // Allow registration even without GPS
      } else if (error.code === 3) {
        errorMessage = 'Timeout mendapatkan lokasi. Silakan coba lagi.';
        setIsLocationAllowed(true); // Allow registration on timeout
      } else {
        errorMessage = 'Error mendapatkan lokasi. Silakan coba lagi.';
        setIsLocationAllowed(true); // Allow registration on other errors
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [checkLocationSecurity]);

  // Manual recheck function
  const recheckLocation = useCallback(async () => {
    await getCurrentLocationAndCheck();
  }, [getCurrentLocationAndCheck]);

  // Auto-check location on mount and set up continuous monitoring
  useEffect(() => {
    // Initial check with delay to ensure component is ready
    const timer = setTimeout(() => {
      getCurrentLocationAndCheck();
    }, 1000);

    return () => clearTimeout(timer);
  }, [getCurrentLocationAndCheck]);

  // Watch for location changes
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!isGeolocationPosition(position)) {
          console.error('Invalid geolocation position received');
          return;
        }

        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Only update if location changed significantly (more than 5 meters for better accuracy)
        if (currentLocation) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
          );

          if (distance > 5) {
            setCurrentLocation(newLocation);
            checkLocationSecurity(newLocation);
          }
        } else {
          setCurrentLocation(newLocation);
          checkLocationSecurity(newLocation);
        }
      },
      (error) => {
        // Silently handle watch position errors to avoid console spam
        if (error.code !== 1) { // Only log non-permission errors
          console.log('Watch position:', error.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 30000 // Reduced cache time for better accuracy
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [currentLocation, calculateDistance, checkLocationSecurity]);

  return {
    isLocationAllowed,
    isLoading,
    error,
    duplicateUser,
    currentLocation,
    recheckLocation,
    accuracy: currentLocation?.accuracy || null
  };
}