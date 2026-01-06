import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  categories: string[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  maxSelection?: number;
  error?: string;
}

export function CategorySelector({ 
  categories, 
  selectedCategories, 
  onChange, 
  maxSelection = 3,
  error 
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      // Remove category
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      // Add category if not exceeding max
      if (selectedCategories.length < maxSelection) {
        onChange([...selectedCategories, category]);
      }
    }
  };

  const handleRemoveCategory = (category: string) => {
    onChange(selectedCategories.filter(c => c !== category));
  };

  return (
    <div className="space-y-2">
      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-orange-800">
            Kategori Terpilih ({selectedCategories.length}/{maxSelection}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                <span className="text-orange-100">{index + 1}.</span>
                <span>{category}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="ml-1 hover:bg-orange-600 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Selection Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-auto min-h-[44px] justify-start text-left border-2 transition-colors",
          error ? "border-red-500" : "border-orange-300",
          "hover:border-orange-400 focus:border-orange-500"
        )}
      >
        <div className="flex-1">
          {selectedCategories.length === 0 ? (
            <span className="text-gray-500 text-sm">
              Pilih Kategori Contest (1-{maxSelection} kategori)
            </span>
          ) : (
            <span className="text-sm font-semibold text-gray-800">
              {selectedCategories.length} kategori dipilih
            </span>
          )}
        </div>
        <span className={cn(
          "ml-2 transition-transform",
          isOpen && "rotate-180"
        )}>
          ▼
        </span>
      </Button>

      {/* Category List */}
      {isOpen && (
        <div className="bg-white border-2 border-orange-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            {categories.map((category, index) => {
              const isSelected = selectedCategories.includes(category);
              const isDisabled = !isSelected && selectedCategories.length >= maxSelection;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && handleToggleCategory(category)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    isSelected 
                      ? "bg-orange-500 text-white" 
                      : isDisabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-50 hover:bg-orange-50 text-gray-800"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center",
                    isSelected 
                      ? "bg-white border-white" 
                      : "border-gray-300"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-orange-500" />}
                  </div>
                  <span className="text-orange-600 font-semibold text-sm flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span className={cn(
                    "text-sm flex-1",
                    isSelected ? "font-semibold" : "font-medium"
                  )}>
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && (
        <p className="text-xs text-gray-500">
          {selectedCategories.length === 0 
            ? `Pilih minimal 1 kategori, maksimal ${maxSelection} kategori`
            : selectedCategories.length >= maxSelection
              ? `Maksimal ${maxSelection} kategori sudah dipilih`
              : `Anda bisa memilih ${maxSelection - selectedCategories.length} kategori lagi`
          }
        </p>
      )}
    </div>
  );
}
