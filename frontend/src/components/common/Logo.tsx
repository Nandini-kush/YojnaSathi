import React from 'react';
import { cn } from '@/lib/utils';
import logo from "@/assets/yojnasathi_logo.png";

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className,
  textClassName,
}) => {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      image: 'h-7 w-auto object-contain',
      text: 'text-lg font-bold',
    },
    md: {
      container: 'gap-2.5',
      image: 'h-10 w-auto object-contain',
      text: 'text-2xl font-bold',
    },
    lg: {
      container: 'gap-3.5',
      image: 'h-14 w-auto object-contain',
      text: 'text-3xl font-extrabold',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center select-none", currentSize.container, className)}>
      <img 
        src={logo} 
        alt="YojnaSathi Logo" 
        className={currentSize.image} 
      />
      
      {showText && (
        <span className={cn(
          "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight font-extrabold",
          currentSize.text,
          textClassName
        )}>
          YojnaSathi
        </span>
      )}
    </div>
  );
};

export default Logo;
