import React from 'react';
import ReactDOM from 'react-dom';
import '../style/Modal.css';

const ConfirmModal = ({ isOpen, onConfirm, onCancel,customMSG }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-content">
                {
                    customMSG ? (<h3>{customMSG}</h3>) : <h3>האם אתה בטוח שאתה רוצה למחוק?</h3>
                }
                <div className="modal-buttons">
                    <button className="btn-confirm" onClick={onConfirm}>כן</button>
                    <button className="btn-cancel" onClick={onCancel}>ביטול</button>
                </div>
            </div>
        </div>,
        document.body // המודאל מוצג ישירות בתוך ה-body של ה-DOM
    );
};

export default ConfirmModal;
