import React from 'react';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={id} // Use id as name for form submission and state management
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        {...props} // Allows passing other HTML input attributes like required, minLength etc.
      />
    </div>
  );
};

export default Input;