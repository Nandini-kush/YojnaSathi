import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  glowEffect?: boolean;
}

const AnimatedButton = ({
  className,
  isLoading,
  variant = "default",
  size = "md",
  disabled,
  glowEffect,
  children,
  ...props
}: AnimatedButtonProps) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
    ghost: "text-gray-900 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        glowEffect && "shadow-lg shadow-blue-500/50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      type="button"
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};

export { AnimatedButton };
