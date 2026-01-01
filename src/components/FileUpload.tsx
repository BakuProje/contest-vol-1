import { useState, useCallback, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  reset?: boolean;
}

export function FileUpload({ 
  onFileSelect, 
  accept = "image/jpeg,image/png",
  maxSize = 5 * 1024 * 1024,
  className,
  reset = false
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset file upload when reset prop changes
  useEffect(() => {
    if (reset) {
      setPreview(null);
      setError(null);
    }
  }, [reset]);

  const handleFile = useCallback((file: File | null) => {
    setError(null);
    
    if (!file) {
      setPreview(null);
      onFileSelect(null);
      return;
    }

    if (!accept.split(',').some(type => file.type === type.trim())) {
      setError("Format file tidak didukung. Gunakan JPG atau PNG.");
      return;
    }

    if (file.size > maxSize) {
      setError(`Ukuran file terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  }, [accept, maxSize, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setPreview(null);
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-orange-200 bg-gray-50">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
            <p className="text-white text-xs font-medium">
              Bukti transfer berhasil diupload
            </p>
          </div>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
            isDragging 
              ? "border-orange-500 bg-orange-50" 
              : "border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/50"
          )}
        >
          <div className="flex flex-col items-center justify-center py-4">
            <div className={cn(
              "p-3 rounded-full mb-3 transition-colors",
              isDragging ? "bg-orange-100" : "bg-gray-100"
            )}>
              {isDragging ? (
                <ImageIcon className="h-6 w-6 text-orange-500" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <p className="mb-1 text-xs text-gray-700 font-medium">
              {isDragging ? "Lepaskan file di sini" : "Klik atau seret file"}
            </p>
            <p className="text-[10px] text-gray-500">
              JPG atau PNG (Maks. 5MB)
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={handleInputChange}
          />
        </label>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
