import React from 'react';

const Select = ({ label, id, value, onChange, options, required, error, className }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      >
        {/* Optional: Add a default 'Choose...' option if not required or if you want one */}
        {!required && <option value="">-- Select --</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Select;
