import { useState, useEffect } from "react";
import { X, Plus, Minus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motorcycleIcon } from "@/assets";

interface Vehicle {
  vehicleType: string;
  plateNumber: string;
}

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSave: (vehicles: Vehicle[]) => void;
  errors?: Record<string, string>;
}

export function VehicleModal({ isOpen, onClose, vehicles, onSave, errors = {} }: VehicleModalProps) {
  const [localVehicles, setLocalVehicles] = useState<Vehicle[]>(vehicles);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setLocalVehicles(vehicles.length > 0 ? vehicles : [{ vehicleType: "", plateNumber: "" }]);
      setLocalErrors({});
      // Prevent body scroll on mobile
      document.body.classList.add('modal-open');
    } else {
      // Re-enable body scroll
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, vehicles]);

  const addVehicle = () => {
    if (localVehicles.length < 4) {
      setLocalVehicles(prev => [...prev, { vehicleType: "", plateNumber: "" }]);
    }
  };

  const removeVehicle = (index: number) => {
    if (localVehicles.length > 1) {
      setLocalVehicles(prev => prev.filter((_, i) => i !== index));
      // Clear related errors
      const newErrors = { ...localErrors };
      delete newErrors[`vehicleType_${index}`];
      delete newErrors[`plateNumber_${index}`];
      setLocalErrors(newErrors);
    }
  };

  const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
    setLocalVehicles(prev => 
      prev.map((vehicle, i) => 
        i === index ? { ...vehicle, [field]: value } : vehicle
      )
    );
    // Clear related error
    const errorKey = `${field}_${index}`;
    if (localErrors[errorKey]) {
      setLocalErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const validateVehicles = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    localVehicles.forEach((vehicle, index) => {
      if (!vehicle.vehicleType.trim()) {
        newErrors[`vehicleType_${index}`] = "Jenis kendaraan wajib diisi";
        isValid = false;
      }
      if (!vehicle.plateNumber.trim()) {
        newErrors[`plateNumber_${index}`] = "Nomor plat wajib diisi";
        isValid = false;
      }
    });

    setLocalErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateVehicles()) {
      onSave(localVehicles);
      onClose();
    }
  };

  const handleClose = () => {
    setLocalErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full mx-0 sm:mx-4 mobile-modal-container animate-mobile-slide-up sm:animate-popup-in flex flex-col android-modal-fix">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 text-center relative flex-shrink-0 safe-area-inset-top">
          <button
            onClick={handleClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white/80 hover:text-white btn-press mobile-touch-target"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-2 sm:mb-4">
            <img 
              src={motorcycleIcon} 
              alt="Motorcycle" 
              className="w-6 h-6 sm:w-8 sm:h-8 brightness-0 invert"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Informasi Kendaraan</h3>
          <p className="text-orange-100 text-xs sm:text-sm">
            Tambahkan informasi motor Anda
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 mobile-modal-content android-content-fix">
          <div className="space-y-4">
            {/* Add Vehicle Button */}
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-700">
                Total Motor: {localVehicles.length}
              </h4>
              {localVehicles.length < 4 && (
                <Button
                  type="button"
                  onClick={addVehicle}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs border-orange-300 text-orange-600 hover:bg-orange-50 btn-press"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Tambah Motor
                </Button>
              )}
            </div>

            {/* Vehicle Forms */}
            {localVehicles.map((vehicle, index) => (
              <div key={index} className="bg-orange-50/50 rounded-xl p-4 space-y-3 border border-orange-200 vehicle-card animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Motor {index + 1}
                  </h4>
                  {localVehicles.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeVehicle(index)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 btn-press"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Jenis Kendaraan
                  </Label>
                  <Input
                    type="text"
                    placeholder="Contoh: Mio Sporty, Mio Smile, dll"
                    value={vehicle.vehicleType}
                    onChange={(e) => updateVehicle(index, "vehicleType", e.target.value)}
                    className={`h-10 sm:h-10 text-sm border-2 input-focus btn-press mobile-input ${
                      localErrors[`vehicleType_${index}`] ? "border-red-500" : "border-orange-200"
                    } focus:border-orange-400`}
                  />
                  {localErrors[`vehicleType_${index}`] && (
                    <p className="text-xs text-red-500 animate-fade-in">
                      {localErrors[`vehicleType_${index}`]}
                    </p>
                  )}
                </div>

                {/* Plate Number */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Nomor Plat
                  </Label>
                  <Input
                    type="text"
                    placeholder="Contoh: DD 1234 AB"
                    value={vehicle.plateNumber}
                    onChange={(e) => updateVehicle(index, "plateNumber", e.target.value)}
                    className={`h-10 sm:h-10 text-sm border-2 input-focus btn-press mobile-input ${
                      localErrors[`plateNumber_${index}`] ? "border-red-500" : "border-orange-200"
                    } focus:border-orange-400`}
                  />
                  {localErrors[`plateNumber_${index}`] && (
                    <p className="text-xs text-red-500 animate-fade-in">
                      {localErrors[`plateNumber_${index}`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50 flex-shrink-0 safe-area-inset-bottom mobile-modal-footer">
          <div className="flex gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 sm:h-11 text-sm border-gray-300 text-gray-700 hover:bg-gray-50 btn-press mobile-touch-target"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 h-11 sm:h-11 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold btn-press mobile-touch-target"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}