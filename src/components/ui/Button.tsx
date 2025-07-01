import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
}

/**
 * Button component following the app's design system
 * Supports multiple variants and sizes with consistent styling
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white shadow-lg hover:shadow-blue-500/25 focus:ring-blue-500",
    secondary:
      "bg-slate-600 hover:bg-slate-700 disabled:bg-slate-600/50 text-white focus:ring-slate-500",
    danger:
      "bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white shadow-lg hover:shadow-red-500/25 focus:ring-red-500",
    ghost:
      "bg-transparent hover:bg-slate-700/50 disabled:bg-transparent text-slate-300 hover:text-white focus:ring-slate-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
