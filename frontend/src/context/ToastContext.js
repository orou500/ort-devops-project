// src/context/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const closeTime = 5000;
  
  
  const addToast = useCallback((toast) => {
    setToasts((prevToasts) => [...prevToasts, toast]);
    
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toast.id));
    }, closeTime); // זמן היסטוריית הטוסט
  }, []);

  const removeToast = (toast) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toast));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} closeTime={closeTime}/>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
