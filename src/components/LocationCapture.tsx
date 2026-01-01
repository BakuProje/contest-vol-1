import { useEffect } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface LocationCaptureProps {
  onLocationCapture: (location: LocationData | null) => void;
  className?: string;
}

// Type guard for GeolocationPosition
function isGeolocationPosition(position: any): position is GeolocationPosition {
  return position && 
         position.coords && 
         typeof position.coords.latitude === 'number' &&
         typeof position.coords.longitude === 'number' &&
         typeof position.coords.accuracy === 'number';
}

export function LocationCapture({ onLocationCapture }: LocationCaptureProps) {
  useEffect(() => {
    // Immediately try to capture location when component mounts
    captureLocationSilently();
  }, []);

  const captureLocationSilently = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      onLocationCapture(null);
      return;
    }

    // Try to get location with reasonable settings
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isGeolocationPosition(position)) {
          console.log("Invalid geolocation position received");
          onLocationCapture(null);
          return;
        }

        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        onLocationCapture(locationData);
      },
      (error) => {
        console.log("Location capture error:", error.code, error.message);
        onLocationCapture(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Component is hidden but still captures location in background
  return null;
}
