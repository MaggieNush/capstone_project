import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  // Effect to close modal on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]); // Dependencies: re-run if isOpen or onClose changes

  if (!isOpen) return null; // Don't render anything if the modal is not open

  return (
    // Backdrop for the modal, covers the entire screen
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose} // Closes the modal when clicking on the backdrop
    >
      {/* Modal content container */}
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto relative transform transition-all sm:my-8 sm:w-full"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from bubbling up and closing it
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
          <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
            aria-label="Close modal"
          >
            {/* SVG for a close (X) icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        {/* Modal Body */}
        <div className="text-gray-700">
          {children} {/* Renders the content passed to the Modal component */}
        </div>
      </div>
    </div>
  );
};

export default Modal;