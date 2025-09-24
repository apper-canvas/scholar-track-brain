import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 shadow-sm hover:shadow-md",
    success: "bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-success-700 hover:to-success-800 focus:ring-success-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
    warning: "bg-gradient-to-r from-warning-600 to-warning-700 text-white hover:from-warning-700 hover:to-warning-800 focus:ring-warning-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
    error: "bg-gradient-to-r from-error-600 to-error-700 text-white hover:from-error-700 hover:to-error-800 focus:ring-error-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-primary-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;