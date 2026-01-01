import { useWebsiteStatus } from '@/hooks/useWebsiteStatus';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export function WebsiteStatusOverlay() {
  const { websiteStatus, loading } = useWebsiteStatus();
  const [dismissed, setDismissed] = useState(false);

  if (loading || websiteStatus.status === 'open' || dismissed) {
    return null;
  }

  const isClosedMode = websiteStatus.status === 'closed';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl border border-red-500/30 p-8 text-white shadow-2xl">
        {/* Close Button - Not available for closed website */}
        {!isClosedMode && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Animated Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 w-24 h-24 border-2 border-red-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            
            {/* Middle pulsing ring */}
            <div className="absolute inset-2 w-20 h-20 border border-red-400/50 rounded-full animate-pulse"></div>
            
            {/* Inner glowing background */}
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            
            {/* Main icon container */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="relative p-6 rounded-full bg-gradient-to-br from-red-500/30 via-red-600/40 to-red-700/30 border border-red-500/50 backdrop-blur-sm shadow-2xl">
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                
                {/* Icon with custom animation */}
                <AlertTriangle className="relative h-12 w-12 text-red-400 animate-pulse" style={{
                  filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))',
                  animation: 'iconGlow 2s ease-in-out infinite alternate'
                }} />
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-red-400/60 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.5s' }}></div>
            <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-red-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}></div>
            <div className="absolute -bottom-2 -right-1 w-2 h-2 bg-red-500/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '1.8s' }}></div>
            <div className="absolute -bottom-1 -left-3 w-1 h-1 bg-red-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }}></div>
          </div>
        </div>

        {/* Add custom CSS for glow animation */}
        <style>{`
          @keyframes iconGlow {
            0% {
              filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5)) brightness(1);
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.8)) brightness(1.2);
              transform: scale(1.05);
            }
            100% {
              filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5)) brightness(1);
              transform: scale(1);
            }
          }
        `}</style>

        {/* Animated Title */}
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent relative">
          <span className="inline-block animate-pulse" style={{ animationDuration: '2s' }}>
            Website Ditutup
          </span>
          
          {/* Glowing underline */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-red-500/60 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
        </h2>

        {/* Status Message */}
        <div className="text-center space-y-4 mb-8">
          {websiteStatus.reason && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30 transform transition-all duration-500 hover:scale-105 hover:bg-slate-800/70 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-xl font-bold text-slate-100 mb-2 animate-pulse" style={{ animationDuration: '3s' }}>
                {websiteStatus.reason}
              </p>
            </div>
          )}
          
          {websiteStatus.description && (
            <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-xl p-4 border border-slate-600/20 transform transition-all duration-500 hover:scale-105 hover:from-slate-800/50 hover:to-slate-700/50 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <p className="text-lg text-slate-300 font-medium">
                {websiteStatus.description}
              </p>
            </div>
          )}

          {websiteStatus.reopen_date && (
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/30 transform transition-all duration-500 hover:scale-105 hover:from-red-500/20 hover:to-red-600/20 animate-fade-in" style={{ animationDelay: '1.1s' }}>
              <p className="text-sm text-red-300 mb-1 font-semibold animate-pulse" style={{ animationDuration: '2s' }}>
                Dibuka kembali pada:
              </p>
              <p className="text-xl font-bold text-white">
                {new Date(websiteStatus.reopen_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Add custom CSS for fade-in animation */}
        <style>{`
          @keyframes fade-in {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
            opacity: 0;
          }
        `}</style>

        {/* Enhanced Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
          {/* Animated background gradients */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-1/2 -left-5 w-20 h-20 bg-red-400/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 right-10 w-3 h-3 bg-red-400/30 rotate-45 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
          <div className="absolute top-32 left-8 w-2 h-2 bg-red-300/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
          <div className="absolute bottom-32 right-6 w-4 h-4 bg-red-500/20 rotate-12 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
          <div className="absolute bottom-20 left-12 w-2 h-8 bg-red-400/15 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}></div>
          
          {/* Subtle moving lines */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-red-400/8 to-transparent animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        </div>

        {/* Footer */}
        <div className="text-center relative z-10">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 transform transition-all duration-500 hover:scale-105 hover:bg-slate-900/70 animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <p className="text-sm text-slate-400 mb-2 animate-pulse" style={{ animationDuration: '4s' }}>
              Website sedang tidak dapat diakses
            </p>
            <p className="text-xs text-slate-500">
              Terima kasih atas pengertiannya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}