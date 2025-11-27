
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-bold font-sans transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center shadow-sm";
  
  const variants = {
    primary: "bg-red-700 text-white border-2 border-red-700 hover:bg-red-800 hover:border-red-800 shadow-red-200",
    secondary: "bg-green-700 text-white border-2 border-green-700 hover:bg-green-800 hover:border-green-800 shadow-green-200",
    outline: "bg-white text-red-700 border-2 border-red-700 hover:bg-red-50",
    danger: "bg-red-600 text-white border-2 border-red-600 hover:bg-red-700",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 shadow-none px-2"
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
};

export const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  inputClassName = "",
  label,
  disabled
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
  disabled?: boolean;
}) => (
  <div className={`w-full ${className}`}>
    {label && <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-wide">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full p-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all bg-white text-lg text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${inputClassName}`}
    />
  </div>
);

export const TextArea = ({
  value,
  onChange,
  placeholder,
  className = "",
  label
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}) => (
  <div className={`w-full ${className}`}>
    {label && <label className="block text-sm font-bold mb-1 text-gray-700 uppercase tracking-wide">{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white resize-none text-base text-gray-900"
    />
  </div>
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`bg-white p-4 rounded-2xl shadow-md border border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);
