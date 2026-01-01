import { useState, useEffect, useCallback } from 'react';

interface LocationPermissionResult {
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  isModalOpen: boolean;
  hasLocation: boolean;
  showModal: () => void;
  hideModal: () => void;
  checkPermission: () => Promise<void>;
}

export function useLocationPermission(): LocationPermissionResult {
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const checkPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      return;
    }

    try {
      // Check if Permissions API is available
      if ('permissions' in navigator && (navigator as any).permissions) {
        const permission = await (navigator as any).permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state as 'prompt' | 'granted' | 'denied');
        
        // Listen for permission changes
        permission.onchange = () => {
          setPermissionStatus(permission.state as 'prompt' | 'granted' | 'denied');
        };
      } else {
        // Fallback: try to get location to determine permission status
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissionStatus('granted');
            setHasLocation(true);
          },
          (error) => {
            console.log('Location permission check:', error.code === 1 ? 'Permission denied' : 'Other error');
            if (error.code === 1) {
              setPermissionStatus('denied');
            } else {
              setPermissionStatus('prompt');
            }
            setHasLocation(false);
          },
          { 
            timeout: 5000, 
            maximumAge: 60000,
            enableHighAccuracy: false
          }
        );
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setPermissionStatus('unknown');
    }
  }, []);

  const showModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-show modal if permission is needed
  useEffect(() => {
    if (permissionStatus === 'prompt' || (permissionStatus === 'denied' && !hasLocation)) {
      // Small delay to ensure component is ready
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [permissionStatus, hasLocation]);

  return {
    permissionStatus,
    isModalOpen,
    hasLocation,
    showModal,
    hideModal,
    checkPermission
  };
}