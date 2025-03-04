// src/components/ToastContainer.js
import React from 'react';
import Toast from './Toast';
import '../style/Toast.css'; // סטיילינג

const ToastContainer = ({ toasts, removeToast, closeTime }) => {
    
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} closeTime={closeTime}/>
      ))}
    </div>
  );
};

export default ToastContainer;

