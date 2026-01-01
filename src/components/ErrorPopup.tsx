import { useState, useEffect } from "react";
import { X, AlertTriangle, RefreshCw, Info } from "lucide-react";

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  isDuplicate?: boolean;
}

export function ErrorPopup({ isOpen, onClose, message, isDuplicate = false }: ErrorPopupProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase(0);
      
      // Animation sequence
      const timer1 = setTimeout(() => setAnimationPhase(1), 200);
      const timer2 = setTimeout(() => setAnimationPhase(2), 600);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLocationDuplicate = message.includes("Lokasi Anda sama");
  const isNamePhoneDuplicate = message.includes("sudah terdaftar");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      {/* Main Popup */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-error-popup">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-8 text-center overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_50%)]" />
          </div>

          {/* Error Icon with Animation */}
          <div className="relative mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full transition-all duration-700 ${
              animationPhase >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
            </div>
            
            {/* Warning Effects */}
            <div className={`absolute -top-1 -right-1 transition-all duration-500 delay-300 ${
              animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="w-4 h-4 bg-yellow-300 rounded-full animate-ping" />
            </div>
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold text-white mb-2 transition-all duration-500 delay-200 ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {isDuplicate || isNamePhoneDuplicate || isLocationDuplicate ? "Pendaftaran Duplikat" : "Gagal Mendaftar"}
          </h3>

          {/* Subtitle */}
          <p className={`text-red-100 text-sm font-medium transition-all duration-500 delay-400 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {isDuplicate || isNamePhoneDuplicate || isLocationDuplicate ? "Data sudah ada di sistem" : "Terjadi kesalahan"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          <div className={`transition-all duration-500 delay-600 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Error Type Card */}
            <div className="mb-4">
              {isLocationDuplicate ? (
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-800 mb-1">Lokasi Duplikat</p>
                    <p className="text-xs text-orange-600">Sistem keamanan mendeteksi lokasi yang sama</p>
                  </div>
                </div>
              ) : isNamePhoneDuplicate ? (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Data Duplikat</p>
                    <p className="text-xs text-yellow-600">Nama atau nomor WhatsApp sudah terdaftar</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-1">Error Sistem</p>
                    <p className="text-xs text-red-600">Terjadi kesalahan saat memproses data</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Detailed Message */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-3 transition-all duration-500 delay-800 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                Tutup & Coba Lagi
              </span>
            </button>
            
            {!isDuplicate && !isNamePhoneDuplicate && !isLocationDuplicate && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Muat Ulang Halaman
                </span>
              </button>
            )}
          </div>

          {/* Footer Note */}
          <div className={`text-center transition-all duration-500 delay-1000 ${
            animationPhase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-xs text-gray-500">
              Butuh bantuan? Hubungi admin 5TL Makassar 📞
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}