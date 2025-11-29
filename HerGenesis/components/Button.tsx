import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  // Game-style 3D buttons with border-bottom for depth
  const baseStyles = "relative font-bold rounded-2xl transition-all duration-100 flex items-center justify-center gap-2 transform active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-4";
  
  const variants = {
    // Purple (Primary)
    primary: "bg-[#8B5CF6] text-white border-b-4 border-[#6D28D9] hover:brightness-110",
    // Teal/Blue
    secondary: "bg-[#4ECDC4] text-white border-b-4 border-[#2EAFA6] hover:brightness-110",
    // Yellow
    accent: "bg-[#FFE66D] text-gray-800 border-b-4 border-[#E6C840] hover:brightness-110",
    // Red/Ghost
    danger: "bg-white text-rose-500 border-2 border-rose-100 border-b-4 border-rose-200 hover:bg-rose-50"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs border-b-[3px] rounded-xl",
    md: "px-6 py-3 text-base border-b-4",
    lg: "px-8 py-4 text-lg border-b-[6px] rounded-3xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};