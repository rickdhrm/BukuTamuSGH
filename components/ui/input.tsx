import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, required, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn("form-input", error && "error", className)}
          {...props}
        />
        {error && <p className="form-error animate-fade-in">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
