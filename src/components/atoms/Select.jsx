import React from "react";
import { cn } from "@/utils/cn";

const Select = React.forwardRef(({ 
  className, 
  children,
  error,
  ...props 
}, ref) => {
  return (
    <select
      className={cn(
        "w-full px-3 py-2 text-sm border rounded-md shadow-sm transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        "bg-white cursor-pointer",
        error 
          ? "border-error-300 focus:ring-error-500" 
          : "border-gray-300 hover:border-gray-400",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;