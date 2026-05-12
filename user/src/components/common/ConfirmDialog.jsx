import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
    open,
    title = 'Are you sure?',
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'danger',
    busy = false,
    onConfirm,
    onCancel,
}) {
    const dialogRef = useRef(null);
    const previousFocus = useRef(null);

    useEffect(() => {
        if (!open) return;
        previousFocus.current = document.activeElement;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !busy) onCancel?.();
        };
        document.addEventListener('keydown', handleKey);
        const button = dialogRef.current?.querySelector('[data-autofocus]');
        button?.focus();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = previousOverflow;
            previousFocus.current?.focus?.();
        };
    }, [open, busy, onCancel]);

    if (!open) return null;

    return (
        <div
            className="confirm-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !busy) onCancel?.();
            }}
        >
            <div className="confirm-card" ref={dialogRef}>
                <button
                    type="button"
                    className="confirm-close"
                    onClick={() => !busy && onCancel?.()}
                    aria-label="Close dialog"
                    disabled={busy}
                >
                    <X size={16} />
                </button>
                <div className={`confirm-icon confirm-icon-${tone}`} aria-hidden="true">
                    <AlertTriangle size={22} />
                </div>
                <h2 id="confirm-title" className="confirm-title">{title}</h2>
                {description && <p className="confirm-description">{description}</p>}
                <div className="confirm-actions">
                    <button
                        type="button"
                        className="confirm-btn confirm-btn-cancel"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        data-autofocus
                        className={`confirm-btn confirm-btn-${tone}`}
                        onClick={onConfirm}
                        disabled={busy}
                        aria-busy={busy}
                    >
                        {busy ? 'Working...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
