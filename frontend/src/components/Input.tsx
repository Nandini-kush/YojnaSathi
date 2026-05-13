import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  // Ensure error is always a string if it exists
  const errorMessage = typeof error === 'string' ? error : null;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          ${errorMessage ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {errorMessage && <p className="mt-1 text-sm text-red-500">{errorMessage}</p>}
      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default Input;
