import React, { useState, useCallback, useMemo, Suspense } from "react";
import { Send, Loader2, User, CheckCircle, X, Plus, Edit3, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackageSelector } from "@/components/PackageSelector";
import { TransferInfo } from "@/components/TransferInfo";
import { FileUpload } from "@/components/FileUpload";
import { LocationCapture } from "@/components/LocationCapture";
import { LocationPermissionModal } from "@/components/LocationPermissionModal";
import { GPSSecurityStatus } from "@/components/GPSSecurityStatus";
import { VehicleModal } from "@/components/VehicleModal";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { useGPSSecurity } from "@/hooks/useGPSSecurity";
import { useLocationPermission } from "@/hooks/useLocationPermission";
import { supabase } from "@/integrations/supabase/client";
import { whatsappIcon, motorcycleIcon, categoryIcon, instagramIcon, tiktokIcon } from "@/assets";

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

export function RegistrationForm() {
  const { toast } = useToast();
  
  // Initialize hooks with error handling
  let gpsHookResult;
  let locationPermissionResult;
  
  try {
    gpsHookResult = useGPSSecurity();
  } catch (error) {
    console.error('GPS Security Hook Error:', error);
    gpsHookResult = {
      isLocationAllowed: true,
      currentLocation: null,
      error: null,
      duplicateUser: null
    };
  }
  
  try {
    locationPermissionResult = useLocationPermission();
  } catch (error) {
    console.error('Location Permission Hook Error:', error);
    locationPermissionResult = {
      permissionStatus: 'unknown',
      isModalOpen: false,
      hasLocation: false,
      hideModal: () => {},
      checkPermission: async () => {}
    };
  }
  
  const { isLocationAllowed, currentLocation, error: gpsError, duplicateUser } = gpsHookResult;
  const { 
    permissionStatus, 
    isModalOpen, 
    hasLocation, 
    hideModal, 
    checkPermission 
  } = locationPermissionResult;

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetFileUpload, setResetFileUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateUserInfo, setDuplicateUserInfo] = useState<string | null>(null);

  // Show duplicate popup when GPS detects duplicate location
  React.useEffect(() => {
    if (!isLocationAllowed && duplicateUser && !showDuplicatePopup) {
      setShowDuplicatePopup(true);
    }
  }, [isLocationAllowed, duplicateUser, showDuplicatePopup]);
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
    
    // Set detailed error message
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

    // Check GPS security first (hidden from user)
    if (!isLocationAllowed) {
      setErrorMessage("Maaf, terjadi masalah dengan pendaftaran Anda. Silakan coba lagi nanti atau hubungi admin.");
      setShowErrorPopup(true);
      return;
    }

    if (!validateForm()) {
      setShowErrorPopup(true);
      return;
    }

    // Use current location from GPS security hook or form location
    let locationToUse = currentLocation || formData.location;

    // If no location from GPS hooks, try to get it directly as fallback
    if (!locationToUse && navigator.geolocation) {
      try {
        console.log('🔄 Fallback: Trying to get location directly...');
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
        });
        
        locationToUse = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        console.log('✅ Fallback location obtained:', locationToUse);
      } catch (error) {
        console.log('❌ Fallback location failed:', error);
        // Continue without location
      }
    }

    // Debug: Check if location is captured
    console.log("🗺️ Form location data:", {
      currentLocation,
      formLocation: formData.location,
      locationToUse,
      gpsError,
      isLocationAllowed
    });

    // Use regular submit function
    try {
      setIsSubmitting(true);
        // Check for duplicate name and phone
        const { data: existingRegistrations } = await supabase
          .from('registrations')
          .select('id, full_name, whatsapp, latitude, longitude')
          .or(`full_name.eq.${formData.fullName.trim()},whatsapp.eq.${formData.whatsapp.trim()}`);

        if (existingRegistrations && existingRegistrations.length > 0) {
          // Check for exact name and phone match
          const exactMatch = existingRegistrations.find(reg => 
            reg.full_name === formData.fullName.trim() && reg.whatsapp === formData.whatsapp.trim()
          );
          
          if (exactMatch) {
            setErrorMessage("Nama dan nomor WhatsApp ini sudah terdaftar. Gunakan nama atau nomor yang berbeda.");
            setShowErrorPopup(true);
            return;
          }
        }

        // Check for duplicate location if location is available
        if (locationToUse?.latitude && locationToUse?.longitude) {
          const { data: locationRegistrations } = await supabase
            .from('registrations')
            .select('id, full_name, latitude, longitude')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

          if (locationRegistrations && locationRegistrations.length > 0) {
            // Check if any registration is within 50 meters using Haversine formula
            const duplicateLocation = locationRegistrations.find(reg => {
              if (!reg.latitude || !reg.longitude) return false;
              
              // Calculate distance using Haversine formula for more accuracy
              const R = 6371e3; // Earth's radius in meters
              const φ1 = locationToUse!.latitude * Math.PI/180;
              const φ2 = reg.latitude * Math.PI/180;
              const Δφ = (reg.latitude - locationToUse!.latitude) * Math.PI/180;
              const Δλ = (reg.longitude - locationToUse!.longitude) * Math.PI/180;

              const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ/2) * Math.sin(Δλ/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = R * c; // Distance in meters

              return distance < 50; // 50 meters threshold for higher accuracy
            });

            if (duplicateLocation) {
              // Show specific duplicate location popup instead of generic error
              setDuplicateUserInfo(duplicateLocation.full_name);
              setShowDuplicatePopup(true);
              return;
            }
          }
        } else {
          // If no location data, show warning but allow registration
          console.warn("No location data available for duplicate check");
        }

        // Upload proof image
        const proofUrl = await uploadProofImage(formData.proofFile!);

        // Insert registration data - now handling multiple vehicles
        const registrationData = {
          full_name: formData.fullName.trim(),
          whatsapp: formData.whatsapp.trim(),
          vehicle_type: formData.vehicles.map(v => v.vehicleType.trim()).join(', '),
          plate_number: formData.vehicles.map(v => v.plateNumber.trim()).join(', '),
          category: formData.category,
          package_type: formData.packageType as 'contest' | 'meetup',
          proof_url: proofUrl,
          latitude: locationToUse?.latitude || null,
          longitude: locationToUse?.longitude || null,
          vehicle_count: formData.vehicles.length,
        };

        console.log('💾 Saving registration data:', {
          ...registrationData,
          hasLocation: !!(locationToUse?.latitude && locationToUse?.longitude)
        });

        const { error } = await supabase
          .from('registrations')
          .insert(registrationData);

        if (error) {
          console.error('Database error:', error);
          throw new Error(`Gagal menyimpan data pendaftaran: ${error.message}`);
        }

        // Show success popup
        setShowSuccessPopup(true);

        // Reset form immediately after success
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
        
        // Reset file upload component
        setResetFileUpload(true);
        setTimeout(() => setResetFileUpload(false), 100);
    } catch (error: any) {
      setErrorMessage(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
    // Clear all form data when closing error popup
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
    // Reset file upload component
    setResetFileUpload(true);
    setTimeout(() => setResetFileUpload(false), 100);
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const addVehicle = useCallback(() => {
    setShowVehicleModal(true);
  }, []);

  const handleVehicleSave = useCallback((vehicles: Vehicle[]) => {
    setFormData(prev => ({ ...prev, vehicles }));
    // Clear vehicle-related errors
    const newErrors = { ...errors };
    vehicles.forEach((_, index) => {
      delete newErrors[`vehicleType_${index}`];
      delete newErrors[`plateNumber_${index}`];
    });
    setErrors(newErrors);
  }, [errors]);

  // Memoize categories to prevent re-renders
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
      {/* Simplified background - Mobile optimized */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Simple static gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-800/30 via-transparent to-yellow-600/20"></div>
        
        {/* Minimal decorative elements - only on larger screens */}
        <div className="hidden sm:block absolute top-20 -left-20 w-40 h-40 bg-orange-700/30 rounded-full blur-2xl"></div>
        <div className="hidden sm:block absolute bottom-20 -right-20 w-40 h-40 bg-yellow-600/30 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      
      {/* Main Content */}
      <main className="container px-3 sm:px-4 py-6 sm:py-8 relative z-10 mobile-container">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-8 hero-section">
            <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg hero-title">
              Daftar Sekarang!
            </h2>
            <p className="text-orange-100 text-sm sm:text-base max-w-md mx-auto leading-relaxed hero-subtitle">
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
                <p className="text-xs text-red-500">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <img 
                  src={whatsappIcon} 
                  alt="WhatsApp" 
                  className="w-4 h-4 whatsapp-icon"
                />
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
                <p className="text-xs text-red-500">
                  {errors.whatsapp}
                </p>
              )}
            </div>

            {/* Vehicle Information - Clean UI with Button */}
            <div className="space-y-3">
              <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <img 
                  src={motorcycleIcon} 
                  alt="Motorcycle" 
                  className="w-4 h-4"
                />
                Informasi Kendaraan ({formData.vehicles.length} Motor)
              </Label>
              
              {/* Vehicle Summary Card */}
              <div className="bg-orange-50/50 rounded-xl p-3 sm:p-4 border border-orange-200 overflow-hidden">
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
                      <span className="hidden sm:inline">Edit Informasi Kendaraan</span>
                      <span className="sm:hidden">Edit Kendaraan</span>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full mb-2 sm:mb-3">
                      <img 
                        src={motorcycleIcon} 
                        alt="Motorcycle" 
                        className="w-5 h-5 sm:w-6 sm:h-6 opacity-60"
                      />
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
                      <span className="hidden sm:inline">Tambah Informasi Kendaraan</span>
                      <span className="sm:hidden">Tambah Kendaraan</span>
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Vehicle Errors */}
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
                <img 
                  src={categoryIcon} 
                  alt="Category" 
                  className="w-4 h-4"
                  style={{ filter: 'hue-rotate(20deg) saturate(1.5) brightness(0.8)' }}
                />
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
                <p className="text-xs text-red-500">
                  {errors.category}
                </p>
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
                <p className="text-xs text-red-500">
                  {errors.packageType}
                </p>
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
                <p className="text-xs text-red-500">
                  {errors.proofFile}
                </p>
              )}
            </div>

            {/* GPS Security - Hidden but active in background */}
            {/* GPS Security Status - This handles all location functionality */}
            <div style={{ display: 'none' }}>
              <GPSSecurityStatus 
                onLocationUpdate={(location) => updateField("location", location)}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className={`w-full h-12 font-bold rounded-xl shadow-lg transition-all duration-200 text-base ${
                  !isLocationAllowed 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                }`}
                disabled={isSubmitting || !isLocationAllowed}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : !isLocationAllowed ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Tidak Dapat Mendaftar
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
                  window.open('https://wa.me/6281228019788?text=Halo%20Admin,%20saya%20butuh%20bantuan%20untuk%20pendaftaran%20Fun%20Bike%20Contest', '_blank');
                }}
                className="w-full h-11 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 text-sm font-semibold"
              >
                <img 
                  src={whatsappIcon} 
                  alt="WhatsApp" 
                  className="w-4 h-4 mr-2 whatsapp-icon"
                />
                Hubungi Admin
              </Button>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-4 sm:mt-6 text-center text-orange-100 space-y-2 sm:space-y-3 footer-mobile">
            <div>
              <p className="text-sm font-semibold mb-2">Social Media</p>
              <div className="flex items-center justify-center gap-3 sm:gap-4 social-links">
                <a 
                  href="https://www.instagram.com/5tl_makassar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors touch-target"
                >
                  <img 
                    src={instagramIcon} 
                    alt="Instagram" 
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-xs sm:text-sm">Instagram</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@5tl_makassar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-white transition-colors touch-target"
                >
                  <img 
                    src={tiktokIcon} 
                    alt="TikTok" 
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-xs sm:text-sm">TikTok</span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Vehicle Modal */}
      <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="text-white">Loading...</div></div>}>
        <VehicleModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          vehicles={formData.vehicles}
          onSave={handleVehicleSave}
          errors={errors}
        />
      </Suspense>

      {/* Lightweight Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-popup-in">
            {/* Header */}
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

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-bold text-green-800 text-sm mb-2">
                  Langkah Selanjutnya:
                </h5>
                <div className="space-y-1 text-xs text-green-700">
                  <p>• Verifikasi pembayaran dalam 1x24 jam</p>
                  <p>• Konfirmasi via WhatsApp</p>
                  <p>• Siap ikut event</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
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

      {/* Lightweight Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-popup-in">
            {/* Header */}
            <div className="bg-red-500 p-4 text-center rounded-t-2xl relative">
              <button
                onClick={handleCloseErrorPopup}
                className="absolute top-2 right-2 text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
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

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">
                  {errorMessage}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-2">
              <button
                onClick={handleCloseErrorPopup}
                className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors"
              >
                Coba Lagi
              </button>
              
              <button
                onClick={() => {
                  handleCloseErrorPopup();
                  window.open('https://wa.me/6281228019788?text=Halo%20Admin,%20saya%20mengalami%20masalah%20saat%20mendaftar%20Fun%20Bike%20Contest', '_blank');
                }}
                className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4 whatsapp-icon" />
                Hubungi Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Duplicate Location Popup */}
      {showDuplicatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-popup-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-center rounded-t-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Lokasi Sudah Terdaftar
              </h3>
              <p className="text-orange-100 text-sm">
                Seseorang sudah mendaftar dari lokasi ini
              </p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-orange-800 text-sm mb-2">
                      Informasi Pendaftar:
                    </h5>
                    <div className="space-y-1 text-xs text-orange-700">
                      <p><strong>Nama:</strong> {duplicateUserInfo}</p>
                      <p><strong>Status:</strong> Sudah Terdaftar</p>
                      <p><strong>Lokasi:</strong> Sama dengan Anda</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-blue-800 text-sm mb-1">
                      Mengapa ini terjadi?
                    </h5>
                    <p className="text-xs text-blue-700">
                      Sistem mendeteksi bahwa seseorang sudah mendaftar dari lokasi yang sama dengan Anda (dalam radius 50 meter). Ini untuk mencegah pendaftaran ganda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-green-800 text-sm mb-1">
                      Apa yang harus dilakukan?
                    </h5>
                    <div className="text-xs text-green-700 space-y-1">
                      <p>• Jika Anda adalah <strong>{duplicateUserInfo}</strong>, tidak perlu mendaftar lagi</p>
                      <p>• Jika bukan, hubungi admin untuk bantuan</p>
                      <p>• Admin akan membantu verifikasi data Anda</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setShowDuplicatePopup(false);
                  window.open('https://wa.me/6281228019788?text=Halo%20Admin,%20saya%20mengalami%20masalah%20pendaftaran.%20Sistem%20mendeteksi%20lokasi%20saya%20sama%20dengan%20pendaftar%20atas%20nama%20' + encodeURIComponent(duplicateUserInfo || '') + '.%20Mohon%20bantuan%20untuk%20verifikasi.', '_blank');
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
              >
                <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4 whatsapp-icon" />
                Hubungi Admin untuk Bantuan
              </button>
              
              <button
                onClick={() => setShowDuplicatePopup(false)}
                className="w-full bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={isModalOpen}
        onLocationGranted={() => {
          hideModal();
          checkPermission();
          toast({
            title: "Lokasi Diaktifkan",
            description: "Terima kasih! Lokasi berhasil diaktifkan.",
            duration: 500,
          });
        }}
        onLocationDenied={() => {
          hideModal();
          toast({
            title: "Peringatan",
            description: "Tanpa lokasi, admin tidak dapat melihat lokasi pendaftaran Anda.",
            variant: "destructive",
            duration: 500,
          });
        }}
      />
    </div>
  );
}
