import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  type = 'button',
  ...props
}) => {
  const baseStyles = "px-4 py-3 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 shadow-md",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    outline: "border-2 border-black text-black hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  label
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  label?: string;
}) => (
  <div className={`w-full ${className}`}>
    {label && <label className="block text-sm font-bold mb-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors bg-white text-base"
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
    {label && <label className="block text-sm font-bold mb-1">{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors bg-white resize-none text-base"
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 ${className}`}>
    {children}
  </div>
);