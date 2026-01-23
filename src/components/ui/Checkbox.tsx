"use client";

import { InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={`peer size-5 cursor-pointer appearance-none rounded border border-[#E5E5E5] bg-white transition-colors checked:border-[#FF9500] checked:bg-[#FF9500] focus:outline-none focus:ring-2 focus:ring-[#FF9500] focus:ring-offset-2 ${className}`}
            {...props}
          />
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="cursor-pointer text-sm text-[#333333]"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
