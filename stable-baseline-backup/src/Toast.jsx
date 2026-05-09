/**
 * Toast - Global Toast Notification Component
 * 
 * Provides user-friendly notifications for:
 * - Success messages
 * - Error messages
 * - Warning messages
 * - Info messages
 * - Progress updates
 */

import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

/**
 * Toast component
 * @param {Object} props - Component props
 * @param {Object} props.toast - Toast data
 * @param {Function} props.onClose - Close callback
 */
export const Toast = ({ toast, onClose }) => {
  const timeoutRef = useRef(null);
  const Icon = toastIcons[toast.type] || Info;

  useEffect(() => {
    if (toast.duration) {
      timeoutRef.current = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.duration, toast.id, onClose]);

  const handleClose = () => {
    onClose(toast.id);
  };

  return (
    <div
      className={`
        relative max-w-sm w-full bg-white border rounded-lg shadow-lg pointer-events-auto
        transform transition-all duration-300 ease-out
        ${toastStyles[toast.type] || toastStyles.info}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <p className="text-sm font-medium">
                {toast.title}
              </p>
            )}
            
            {toast.message && (
              <p className="mt-1 text-sm">
                {toast.message}
              </p>
            )}
            
            {toast.progress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, toast.progress || 0))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {toast.action && (
          <div className="mt-3 flex">
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-3 py-1"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ToastContainer component
 * @param {Object} props - Component props
 * @param {Array} props.toasts - Toast array
 * @param {Function} props.onRemove - Remove callback
 */
export const ToastContainer = ({ toasts, onRemove }) => {
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="fixed top-4 right-4 z-50 space-y-4"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

export default Toast;
