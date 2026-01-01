import { useState, useEffect } from "react";
import { CheckCircle, Sparkles, Trophy, Gift, X } from "lucide-react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessPopup({ isOpen, onClose }: SuccessPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setAnimationPhase(0);
      
      // Animation sequence
      const timer1 = setTimeout(() => setAnimationPhase(1), 300);
      const timer2 = setTimeout(() => setAnimationPhase(2), 800);
      const timer3 = setTimeout(() => setAnimationPhase(3), 1200);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      {/* Confetti Background */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className={`w-2 h-2 ${
                  ['bg-yellow-400', 'bg-orange-400', 'bg-green-400', 'bg-blue-400', 'bg-pink-400'][
                    Math.floor(Math.random() * 5)
                  ]
                } rounded-full`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Popup */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-success-popup">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 p-8 text-center overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_50%)]" />
          </div>

          {/* Success Icon with Animation */}
          <div className="relative mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full transition-all duration-700 ${
              animationPhase >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              <CheckCircle className="w-10 h-10 text-white animate-pulse" />
            </div>
            
            {/* Sparkle Effects */}
            <div className={`absolute -top-2 -right-2 transition-all duration-500 delay-300 ${
              animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow" />
            </div>
            <div className={`absolute -bottom-1 -left-1 transition-all duration-500 delay-500 ${
              animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}>
              <Sparkles className="w-4 h-4 text-yellow-200 animate-bounce" />
            </div>
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold text-white mb-2 transition-all duration-500 delay-200 ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            🎉 Pendaftaran Berhasil!
          </h3>

          {/* Subtitle */}
          <p className={`text-green-100 text-sm font-medium transition-all duration-500 delay-400 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Selamat! Kamu sudah terdaftar
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className={`text-center transition-all duration-500 delay-600 ${
            animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Data pendaftaran Anda telah diterima dengan sukses. Tim kami akan segera memverifikasi pembayaran Anda.
            </p>
            
            {/* Status Cards */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-green-800">Data Tersimpan</p>
                  <p className="text-xs text-green-600">Informasi pendaftaran berhasil disimpan</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-orange-800">Menunggu Verifikasi</p>
                  <p className="text-xs text-orange-600">Tim akan memverifikasi pembayaran Anda</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Gift className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-blue-800">Siap-siap Event!</p>
                  <p className="text-xs text-blue-600">Pantau terus info selanjutnya</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className={`transition-all duration-500 delay-800 ${
            animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Oke, Siap!
              </span>
            </button>
          </div>

          {/* Footer Note */}
          <div className={`text-center transition-all duration-500 delay-1000 ${
            animationPhase >= 3 ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-xs text-gray-500">
              Terima kasih sudah bergabung dengan 5TL Makassar! 🏍️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}