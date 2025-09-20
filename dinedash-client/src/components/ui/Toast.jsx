import React, { useState, useCallback, useEffect } from 'react';
import ToastContext from './toastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, ...toast }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div aria-live="polite" className="fixed z-50 right-4 bottom-6 flex flex-col gap-3">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ type = 'info', title, message, duration = 3000, onClose }) => {
  useEffect(() => {
    const tm = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(tm);
  }, [duration, onClose]);

  const colors = {
    info: 'bg-white text-gray-900',
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
  };

  const icons = {
    info: faInfoCircle,
    success: faCheckCircle,
    error: faTimesCircle,
  };

  return (
    <div className={`max-w-sm w-full shadow-lg rounded-md p-3 border ${colors[type]} animate-slide-up`} role="status">
      <div className="flex items-start gap-3">
        <div className="pt-1">
          <FontAwesomeIcon icon={icons[type]} className="h-6 w-6" />
        </div>
        <div className="flex-1">
          {title && <div className="font-semibold">{title}</div>}
          {message && <div className="text-sm">{message}</div>}
        </div>
        <button onClick={onClose} aria-label="Dismiss" className="text-sm text-gray-500">✕</button>
      </div>
    </div>
  );
};

export default Toast;
