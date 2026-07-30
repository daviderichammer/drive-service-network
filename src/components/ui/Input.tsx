import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, leftAddon, rightAddon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-montserrat font-semibold text-navy mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftAddon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "w-full px-4 py-3 bg-white border rounded-lg text-navy placeholder-gray-400 font-opensans text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent",
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-200 hover:border-gray-300",
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-opensans">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500 font-opensans">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-montserrat font-semibold text-navy mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-lg text-navy placeholder-gray-400 font-opensans text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-vertical min-h-[120px]",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-opensans">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500 font-opensans">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-montserrat font-semibold text-navy mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "w-full px-4 py-3 bg-white border rounded-lg text-navy font-opensans text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent appearance-none cursor-pointer",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-opensans">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500 font-opensans">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Input, Textarea, Select };
