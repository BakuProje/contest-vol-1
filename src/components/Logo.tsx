import { useState } from 'react';
import logo5tl from "@/assets/logo5tl.png";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16', 
    lg: 'h-32 w-32'
  };
  
  const fallbackSizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-16 w-16 text-lg',
    lg: 'h-32 w-32 text-4xl'
  };

  if (imageError) {
    return (
      <div 
        className={`${fallbackSizeClasses[size]} bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl ${className}`}
      >
        5TL
      </div>
    );
  }

  return (
    <img 
      src={logo5tl}
      alt="5TL Logo" 
      className={`${sizeClasses[size]} object-contain drop-shadow-xl ${className}`}
      onError={() => {
        console.error('Logo failed to load, showing fallback');
        setImageError(true);
      }}
    />
  );
}