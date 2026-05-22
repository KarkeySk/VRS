import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import '../styles/ConfirmDialog.css';

const iconMap = {
  danger: AlertCircle,
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}) {
  if (!isOpen) return null;

  const Icon = iconMap[type] || Info;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className={`confirm-dialog ${isDangerous ? 'dangerous' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-dialog-icon confirm-icon-${type}`}>
          <Icon size={32} />
        </div>

        <h2 className="confirm-dialog-title">{title}</h2>

        <p className="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-actions">
          <button
            className="confirm-btn cancel-btn"
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            className={`confirm-btn action-btn ${isDangerous ? 'danger-btn' : 'primary-btn'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
