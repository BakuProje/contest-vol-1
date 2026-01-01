import { cn } from "@/lib/utils";
import { useState } from "react";
import { logobni } from "@/assets";

interface TransferInfoProps {
  className?: string;
}

export function TransferInfo({ className }: TransferInfoProps) {
  const [copied, setCopied] = useState(false);
  const accountNumber = "5505200998";

  const handleCopyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md animate-fade-in overflow-hidden",
        className
      )}
    >
      {/* Logo BNI Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <img src={logobni} alt="BNI Watermark" className="h-32 w-auto" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-xs font-semibold opacity-90 mb-3 uppercase tracking-wide">
          Silakan transfer ke rekening berikut:
        </p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Bank</span>
            <span className="font-bold text-base">BNI</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Nomor Rekening</span>
            <button
              type="button"
              onClick={handleCopyAccountNumber}
              className="font-bold text-base tracking-wider hover:bg-white/10 px-2 py-1 rounded transition-colors relative group"
              title="Klik untuk menyalin"
            >
              5505-2009-98
              {copied && (
                <span className="absolute -top-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-fade-in">
                  Tersalin!
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-80">Atas Nama</span>
            <span className="font-semibold text-sm">Nur Salsabila Putri Rizky</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-[10px] opacity-75 leading-relaxed">
            ⚠️ Jika transfer di luar rekening tersebut, kami tidak bertanggung jawab
          </p>
        </div>
      </div>
    </div>
  );
}
