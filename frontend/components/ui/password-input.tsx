"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";

interface PasswordInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: string;
}

export function PasswordInput({
  id,
  placeholder = "Enter password",
  value,
  onChange,
  disabled = false,
  className = "",
  required = false,
  error,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputId] = useState(id || `password-${Math.random().toString(36).substr(2, 9)}`);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Eye className="w-5 h-5 text-slate-500" />
      </div>
      <Input
        id={inputId}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 pr-10 h-11 bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 text-white placeholder-slate-500 rounded-lg transition-colors ${className}`}
        disabled={disabled}
        required={required}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        disabled={disabled}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-controls={inputId}
      >
        {isVisible ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
      {error && (
        <div id={`${inputId}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
