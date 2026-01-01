import React, { useState } from 'react';
import { MapPin, Shield, AlertTriangle, CheckCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGPSSecurity } from '@/hooks/useGPSSecurity';

interface GPSSecurityStatusProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number; accuracy: number } | null) => void;
}

export function GPSSecurityStatus({ onLocationUpdate }: GPSSecurityStatusProps) {
  const { 
    isLocationAllowed, 
    isLoading, 
    error, 
    duplicateUser, 
    currentLocation, 
    recheckLocation,
    accuracy
  } = useGPSSecurity();

  const [isExpanded, setIsExpanded] = useState(false);

  // Update parent component when location changes
  React.useEffect(() => {
    console.log('🔄 GPSSecurityStatus: Location update:', currentLocation);
    if (onLocationUpdate && currentLocation) {
      onLocationUpdate(currentLocation);
    }
  }, [currentLocation, onLocationUpdate]);

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-500';
    if (error && !isLocationAllowed) return 'text-red-500';
    if (!isLocationAllowed) return 'text-red-500';
    if (currentLocation) return 'text-green-500';
    return 'text-gray-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (error && !isLocationAllowed) return <AlertTriangle className="w-4 h-4" />;
    if (!isLocationAllowed) return <Shield className="w-4 h-4" />;
    if (currentLocation) return <CheckCircle className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Memproses data...';
    if (error && !isLocationAllowed) return 'Terjadi masalah';
    if (!isLocationAllowed && duplicateUser) return `Data sudah ada`;
    if (!isLocationAllowed) return 'Tidak dapat melanjutkan';
    if (currentLocation) {
      const accuracyText = accuracy && accuracy <= 20 ? 'Akurasi Tinggi' : 
                          accuracy && accuracy <= 50 ? 'Akurasi Baik' : 'Akurasi Rendah';
      return `Data valid - ${accuracyText}`;
    }
    return 'Menunggu data...';
  };

  return (
    <div className="space-y-3">
      {/* Main Status Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Sistem Validasi
              </p>
              <p className={`text-xs ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={recheckLocation}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Security Warning */}
        {!isLocationAllowed && !isLoading && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">
                  Registrasi Diblokir
                </p>
                <p className="text-xs text-red-600">
                  Sistem mendeteksi data pendaftaran sudah ada sebelumnya.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-4 shadow-sm animate-fade-in">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Detail Lokasi
          </h4>
          
          {currentLocation ? (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Latitude</p>
                  <p className="font-mono text-gray-800">
                    {currentLocation.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Longitude</p>
                  <p className="font-mono text-gray-800">
                    {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500">Akurasi</p>
                <p className="text-gray-800">
                  ±{Math.round(currentLocation.accuracy)} meter
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-500 mb-1">Status Keamanan</p>
                <div className="flex items-center gap-2">
                  {isLocationAllowed ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-600 font-medium">Lokasi Aman</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600 font-medium">Lokasi Bermasalah</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                {isLoading ? 'Mendapatkan lokasi...' : 'Lokasi belum tersedia'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}