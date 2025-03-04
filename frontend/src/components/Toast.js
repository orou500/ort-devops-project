// src/components/Toast.js
import React, { useEffect, useState, useCallback } from 'react';
import { FaInfoCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import '../style/Toast.css';

const Toast = ({ message, type, onClose, closeTime }) => {
  const [visible, setVisible] = useState(false);

  let icon;
  switch (type) {
    case 'info':
      icon = <FaInfoCircle />;
      break;
    case 'success':
      icon = <IoCheckmarkDoneCircleOutline />;
      break;
    case 'error':
      icon = <FaExclamationCircle />;
      break;
    default:
      icon = null;
  }

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  
  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, closeTime - 100);

    return () => clearTimeout(timer);
  }, [closeTime, handleClose]);


  return (
    <div className={`toast toast-${type} ${visible ? 'show' : 'hide'}`}>
      <FaTimes className="toast-close" onClick={handleClose} />
      <span className="toast-text">{message}</span>
      {icon}
    </div>
  );
};

export default Toast;
