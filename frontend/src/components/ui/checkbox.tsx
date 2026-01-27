import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = ({ className, onCheckedChange, ...props }: CheckboxProps) => (
  <input
    type="checkbox"
    className={cn(
      "h-4 w-4 rounded border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer",
      className
    )}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    {...props}
  />
);

export { Checkbox };
