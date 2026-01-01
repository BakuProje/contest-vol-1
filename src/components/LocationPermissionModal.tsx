import React, { useState, useEffect } from "react";
import { MapPin, Shield, AlertTriangle, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onLocationGranted: () => void;
  onLocationDenied: () => void;
}

export function LocationPermissionModal({ 
  isOpen, 
  onLocationGranted, 
  onLocationDenied 
}: LocationPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const requestLocation = async () => {
    setIsRequesting(true);
    
    try {
      if (!navigator.geolocation) {
        alert('Browser Anda tidak mendukung GPS. Silakan gunakan browser yang lebih baru.');
        onLocationDenied();
        return;
      }

      // Request location permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      // If successful, call onLocationGranted
      onLocationGranted();
      
    } catch (error: any) {
      console.error('Location permission error:', error);
      
      if (error.code === 1) {
        // Permission denied
        setPermissionDenied(true);
        setShowInstructions(true);
      } else if (error.code === 2) {
        alert('Tidak dapat mendeteksi lokasi. Pastikan GPS aktif dan coba lagi.');
      } else if (error.code === 3) {
        alert('Waktu habis. Silakan coba lagi.');
      } else {
        alert('Terjadi kesalahan saat mengakses lokasi. Silakan coba lagi.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTryAgain = () => {
    setPermissionDenied(false);
    setShowInstructions(false);
    requestLocation();
  };

  // Auto-request when modal opens
  useEffect(() => {
    if (isOpen && !permissionDenied) {
      // Small delay to let modal render first
      setTimeout(() => {
        requestLocation();
      }, 500);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md mx-auto bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/50 text-white [&>button]:hidden"
        data-location-modal="true"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 rounded-full bg-orange-500/20 w-fit">
            <MapPin className="h-8 w-8 text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {permissionDenied ? "Akses Lokasi Diperlukan" : "Mengaktifkan GPS..."}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!permissionDenied && !showInstructions ? (
            // Loading state
            <div className="text-center py-6">
              <div className="mx-auto mb-4 p-3 rounded-full bg-blue-500/20 w-fit">
                <RefreshCw className={`h-6 w-6 text-blue-400 ${isRequesting ? 'animate-spin' : ''}`} />
              </div>
              <p className="text-slate-300 mb-2">
                Sedang meminta akses lokasi...
              </p>
              <p className="text-sm text-slate-400">
                Silakan izinkan akses lokasi pada popup browser
              </p>
            </div>
          ) : (
            // Permission denied or instructions
            <>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-400 mb-1">
                      Lokasi Tidak Dapat Diakses
                    </h3>
                    <p className="text-sm text-red-300">
                      Kami memerlukan akses lokasi untuk memverifikasi pendaftaran Anda dan mencegah duplikasi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-1">
                      Mengapa Lokasi Diperlukan?
                    </h3>
                    <ul className="text-sm text-blue-300 space-y-1">
                      <li>• Mencegah pendaftaran ganda</li>
                      <li>• Memverifikasi kehadiran peserta</li>
                      <li>• Keamanan data pendaftaran</li>
                      <li>• Membantu admin dalam koordinasi</li>
                    </ul>
                  </div>
                </div>
              </div>

              {showInstructions && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-400 mb-2">
                        Cara Mengaktifkan Lokasi:
                      </h3>
                      <div className="text-sm text-orange-300 space-y-2">
                        <div>
                          <p className="font-medium">Chrome/Safari:</p>
                          <p>1. Klik ikon 🔒 di address bar</p>
                          <p>2. Pilih "Izinkan" untuk Lokasi</p>
                          <p>3. Refresh halaman</p>
                        </div>
                        <div className="mt-3">
                          <p className="font-medium">Firefox:</p>
                          <p>1. Klik ikon shield di address bar</p>
                          <p>2. Aktifkan "Lokasi"</p>
                          <p>3. Refresh halaman</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleTryAgain}
                  disabled={isRequesting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 focus:outline-none focus:ring-0 active:outline-none"
                >
                  {isRequesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Meminta Akses...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Coba Lagi
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Lokasi diperlukan untuk melanjutkan pendaftaran
                </p>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Dengan melewati lokasi, admin tidak dapat melihat lokasi pendaftaran Anda
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}