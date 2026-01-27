import { cn } from "@/lib/utils";
import React from "react";

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownMenu = ({
  className,
  open,
  onOpenChange,
  children,
  ...props
}: DropdownMenuProps) => (
  <div className={cn("relative inline-block", className)} {...props}>
    {children}
  </div>
);

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = ({
  className,
  asChild,
  children,
  ...props
}: DropdownMenuTriggerProps) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
        (children.props as any).className
      ),
      ...props,
    } as any);
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
}

const DropdownMenuContent = ({
  className,
  align = "end",
  children,
  ...props
}: DropdownMenuContentProps) => {
  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  return (
    <div
      className={cn(
        "absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownMenuItem = ({
  className,
  ...props
}: DropdownMenuItemProps) => (
  <button
    className={cn(
      "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none",
      className
    )}
    {...props}
  />
);

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
