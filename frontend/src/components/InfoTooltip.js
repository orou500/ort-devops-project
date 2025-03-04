import React from 'react';
import { useToast } from '../context/ToastContext';
import { FaInfoCircle } from 'react-icons/fa';

function InfoTooltip({ message }) {

  const { addToast } = useToast();

  return (
    <span
      style={{
        cursor: 'pointer',
        fontSize: '18px',
        color: 'var(--primary-text-color)',
        position: 'relative',
        display: 'inline-block',
      }}
      onClick={() =>
        addToast({
          id: Date.now(),
          message: message,
          type: 'info',
        })
      }
    >
      <FaInfoCircle />
    </span>
  );
}


export default InfoTooltip;
