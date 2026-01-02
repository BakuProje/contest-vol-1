import React, { useState, useCallback, useMemo } from "react";
import { Send, Loader2, User, CheckCircle, X, Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackageSelector } from "@/components/PackageSelector";
import { TransferInfo } from "@/components/TransferInfo";
import { FileUpload } from "@/components/FileUpload";
import { VehicleModal } from "@/components/VehicleModal";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Safe imports with fallbacks
const getAssets = () => {
  try {
    // Try to import assets, but provide fallbacks
    return {
      whatsappIcon: "💬",
      motorcycleIcon: "🏍️", 
      categoryIcon: "📋",
      instagramIcon: "📷",
      tiktokIcon: "🎵"
    };
  } catch (error) {
    console.warn('Assets import failed, using emoji fallbacks');
    return {
      whatsappIcon: "💬",
      motorcycleIcon: "🏍️", 
      categoryIcon: "📋",
      instagramIcon: "📷",
      tiktokIcon: "🎵"
    };
  }
};

const assets = getAssets();

interface Vehicle {
  vehicleType: string;
  plateNumber: string;
}

interface FormData {
  packageType: string;
  fullName: string;
  whatsapp: string;
  vehicles: Vehicle[];
  category: string;
  proofFile: File | null;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
}

export function RegistrationFormRobust() {
  const { toast } = useToast();
  
  // Safe GPS hooks with fallbacks
  const [isLocationAllowed, setIsLocationAllowed] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  
  // Try to use GPS hooks safely
  React.useEffect(() => {
    const initializeGPS = async () => {
      try {
        const { useGPSSecurity } = await import("@/hooks/useGPSSecurity");
        const gpsResult = useGPSSecurity();
        setIsLocationAllowed(gpsResult.isLocationAllowed);
        setCurrentLocation(gpsResult.currentLocation);
      } catch (error) {
        console.warn('GPS hooks failed, using fallback');
        setIsLocationAllowed(true);
        setCurrentLocation(null);
      }
    };
    
    initializeGPS();
  }, []);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetFileUpload, setResetFileUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    packageType: "",
    fullName: "",
    whatsapp: "",
    vehicles: [{ vehicleType: "", plateNumber: "" }],
    category: "",
    proofFile: null,
    location: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | string, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | string, string>> = {};
    const missingFields: string[] = [];

    if (!formData.packageType) {
      newErrors.packageType = "Pilih paket pendaftaran";
      missingFields.push("Paket pendaftaran");
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi";
      missingFields.push("Nama lengkap");
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Nama minimal 3 karakter";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi";
      missingFields.push("Nomor WhatsApp");
    } else if (!/^(\+62|62|08)[0-9]{8,12}$/.test(formData.whatsapp.replace(/\s|-/g, ""))) {
      newErrors.whatsapp = "Format nomor WhatsApp tidak valid";
    }

    // Validate vehicles
    formData.vehicles.forEach((vehicle, index) => {
      if (!vehicle.vehicleType.trim()) {
        newErrors[`vehicleType_${index}`] = "Jenis kendaraan wajib diisi";
        missingFields.push(`Jenis kendaraan motor ${index + 1}`);
      }

      if (!vehicle.plateNumber.trim()) {
        newErrors[`plateNumber_${index}`] = "Nomor plat wajib diisi";
        missingFields.push(`Nomor plat motor ${index + 1}`);
      }
    });

    if (!formData.category) {
      newErrors.category = "Kategori wajib dipilih";
      missingFields.push("Kategori");
    }

    if (!formData.proofFile) {
      newErrors.proofFile = "Upload bukti transfer wajib";
      missingFields.push("Bukti transfer");
    }

    setErrors(newErrors);
    
    if (missingFields.length > 0) {
      setErrorMessage(`Mohon lengkapi Data berikut: ${missingFields.join(", ")}`);
    } else if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).filter(Boolean);
      setErrorMessage(errorMessages.join(". "));
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const uploadProofImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('proofs')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Gagal mengupload bukti transfer');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('proofs')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowErrorPopup(true);
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload proof image
      const proofUrl = await uploadProofImage(formData.proofFile!);

      // Insert registration data
      const registrationData = {
        full_name: formData.fullName.trim(),
        whatsapp: formData.whatsapp.trim(),
        vehicle_type: formData.vehicles.map(v => v.vehicleType.trim()).join(', '),
        plate_number: formData.vehicles.map(v => v.plateNumber.trim()).join(', '),
        category: formData.category,
        package_type: formData.packageType as 'contest' | 'meetup',
        proof_url: proofUrl,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
        vehicle_count: formData.vehicles.length,
      };

      const { error } = await supabase
        .from('registrations')
        .insert(registrationData);

      if (error) {
        throw new Error(`Gagal menyimpan data pendaftaran: ${error.message}`);
      }

      // Show success popup
      setShowSuccessPopup(true);

      // Reset form
      setFormData({
        packageType: "",
        fullName: "",
        whatsapp: "",
        vehicles: [{ vehicleType: "", plateNumber: "" }],
        category: "",
        proofFile: null,
        location: null,
      });
      setErrors({});
      setResetFileUpload(true);
      setTimeout(() => setResetFileUpload(false), 100);
      
    } catch (error: any) {
      setErrorMessage(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleVehicleSave = useCallback((vehicles: Vehicle[]) => {
    setFormData(prev => ({ ...prev, vehicles }));
    const newErrors = { ...errors };
    vehicles.forEach((_, index) => {
      delete newErrors[`vehicleType_${index}`];
      delete newErrors[`plateNumber_${index}`];
    });
    setErrors(newErrors);
  }, [errors]);

  const categories = useMemo(() => [
    "Matic Proper Pemula",
    "Matic Fashion Pemula", 
    "2 Stroke Pemula",
    "Matic Elegant Style",
    "Vietnam Style",
    "2 Tak Modif",
    "Sunmori Matic",
    "Sunmori Non Matic",
    "Proper Pro Matic",
    "Proper Pro Non Matic",
    "Ninja 2T Series Fashion Style",
    "RX Series Fashion Style",
    "Fashion Modif Under 200cc",
    "Big Matic Modif",
    "Racing Look",
    "Restorasi Modifikasi",
    "Meet Up Contest"
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-800/30 via-transparent to-yellow-600/20"></div>
      </div>

      <main className="container px-3 sm:px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
              Daftar Sekarang!
            </h2>
            <p className="text-orange-100 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Ayo isi sebelum kehabisan slot
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-orange-200 p-4 sm:p-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={`h-10 sm:h-11 text-sm border-2 transition-colors ${errors.fullName ? "border-red-500" : "border-orange-300"} focus:border-orange-500`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <span className="text-green-500">{assets.whatsappIcon}</span>
                Nomor WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                className={`h-10 sm:h-11 text-sm border-2 transition-colors ${errors.whatsapp ? "border-red-500" : "border-orange-300"} focus:border-orange-500`}
              />
              {errors.whatsapp && (
                <p className="text-xs text-red-500">{errors.whatsapp}</p>
              )}
            </div>

            {/* Vehicle Information */}
            <div className="space-y-3">
              <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <span className="text-blue-500">{assets.motorcycleIcon}</span>
                Informasi Kendaraan ({formData.vehicles.length} Motor)
              </Label>
              
              <div className="bg-orange-50/50 rounded-xl p-3 sm:p-4 border border-orange-200">
                {formData.vehicles.length > 0 && formData.vehicles[0].vehicleType ? (
                  <div className="space-y-3">
                    {formData.vehicles.map((vehicle, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-orange-100">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 truncate">
                            Motor {index + 1}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {vehicle.vehicleType || "Belum diisi"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {vehicle.plateNumber || "Belum diisi"}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => setShowVehicleModal(true)}
                      variant="outline"
                      className="w-full h-10 border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors text-xs sm:text-sm"
                    >
                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Edit Kendaraan
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full mb-2 sm:mb-3">
                      <span className="text-xl">🏍️</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
                      Belum ada informasi kendaraan
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowVehicleModal(true)}
                      className="h-10 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all text-xs sm:text-sm px-3 sm:px-4"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Tambah Kendaraan
                    </Button>
                  </div>
                )}
              </div>
              
              {Object.keys(errors).some(key => key.includes('vehicleType_') || key.includes('plateNumber_')) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-600">
                    Mohon lengkapi informasi kendaraan dengan benar
                  </p>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <span className="text-purple-500">{assets.categoryIcon}</span>
                Kategori Contest
              </Label>
              <Select value={formData.category} onValueChange={(value) => updateField("category", value)}>
                <SelectTrigger className={`h-10 sm:h-11 text-sm border-2 transition-colors ${errors.category ? "border-red-500" : "border-orange-300"} focus:border-orange-500`}>
                  <SelectValue placeholder="Pilih Kategori Contest" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category} className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 font-semibold text-sm">{index + 1}.</span>
                        <span className="text-sm">{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Package Selection */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Pilih Paket
              </Label>
              <PackageSelector
                value={formData.packageType}
                onChange={(value) => updateField("packageType", value)}
              />
              {errors.packageType && (
                <p className="text-xs text-red-500">{errors.packageType}</p>
              )}
            </div>

            {/* Transfer Info */}
            <div className="py-1">
              <TransferInfo />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Upload Bukti Transfer
              </Label>
              <FileUpload
                onFileSelect={(file) => updateField("proofFile", file)}
                reset={resetFileUpload}
              />
              {errors.proofFile && (
                <p className="text-xs text-red-500">{errors.proofFile}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-12 font-bold rounded-xl shadow-lg transition-all duration-200 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Pendaftaran
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open('https://wa.me/6281228019788?text=Halo%20Admin,%20saya%20butuh%20bantuan%20untuk%20pendaftaran%20Fun%20Bike%20Contest', '_blank');
                  }
                }}
                className="w-full h-11 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 text-sm font-semibold"
              >
                💬 Hubungi Admin
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <VehicleModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          vehicles={formData.vehicles}
          onSave={handleVehicleSave}
          errors={errors}
        />
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <div className="bg-green-500 p-4 text-center rounded-t-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Pendaftaran Berhasil
              </h3>
              <p className="text-green-100 text-sm">
                Data Anda telah tersimpan
              </p>
            </div>
            <div className="p-4">
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <div className="bg-red-500 p-4 text-center rounded-t-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                <X className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Gagal Mendaftar
              </h3>
              <p className="text-red-100 text-sm">
                Ada data yang perlu diperbaiki
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}