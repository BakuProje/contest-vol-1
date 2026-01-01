import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PackageOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

const packages: PackageOption[] = [
  {
    id: "contest",
    name: "Contest",
    price: 350000,
    description: "",
  },
  {
    id: "meetup",
    name: "Meet Up",
    price: 150000,
    description: "",
  },
];

interface PackageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PackageSelector({ value, onChange, className }: PackageSelectorProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={cn("grid gap-3", className)}>
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          type="button"
          onClick={() => onChange(pkg.id)}
          className={cn(
            "relative flex items-start p-4 rounded-xl border-2 text-left transition-colors group",
            value === pkg.id
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 bg-white hover:border-orange-300"
          )}
        >
          <div className={cn(
            "flex items-center justify-center h-5 w-5 rounded-full border-2 mr-3 mt-0.5 transition-colors",
            value === pkg.id
              ? "border-orange-500 bg-orange-500"
              : "border-gray-300 group-hover:border-orange-400"
          )}>
            {value === pkg.id && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className={cn(
                "font-bold text-base transition-colors",
                value === pkg.id ? "text-orange-600" : "text-gray-800"
              )}>
                {pkg.name}
              </h3>
              <span className={cn(
                "font-bold text-base",
                value === pkg.id ? "text-orange-600" : "text-gray-800"
              )}>
                {formatPrice(pkg.price)}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {pkg.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
