import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-lg border-2 bg-white text-brand-black transition-colors
          focus:outline-none focus:ring-0
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-200 focus:border-brand-black'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;