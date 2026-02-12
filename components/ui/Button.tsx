import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-green text-brand-black hover:bg-green-400 focus:ring-green-500 border border-transparent shadow-[0_4px_14px_0_rgba(34,197,94,0.39)]",
    secondary: "bg-brand-black text-white hover:bg-gray-800 focus:ring-gray-900 border border-transparent",
    outline: "bg-transparent text-brand-black border-2 border-brand-black hover:bg-brand-black hover:text-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
  };
  
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-6 py-3",
    lg: "text-base px-8 py-4"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;