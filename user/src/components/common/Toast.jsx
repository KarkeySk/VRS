import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const TONE_ICON = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

let nextId = 1;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            window.clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const push = useCallback((toast) => {
        const id = nextId++;
        const next = {
            id,
            tone: 'info',
            duration: 4500,
            ...toast,
        };
        setToasts((prev) => [...prev, next]);
        if (next.duration > 0) {
            const timer = window.setTimeout(() => dismiss(id), next.duration);
            timers.current.set(id, timer);
        }
        return id;
    }, [dismiss]);

    useEffect(() => {
        const ts = timers.current;
        return () => {
            ts.forEach((t) => window.clearTimeout(t));
            ts.clear();
        };
    }, []);

    const api = useMemo(() => ({
        push,
        dismiss,
        success: (message, opts = {}) => push({ tone: 'success', message, ...opts }),
        error: (message, opts = {}) => push({ tone: 'error', message, duration: 6000, ...opts }),
        info: (message, opts = {}) => push({ tone: 'info', message, ...opts }),
        warning: (message, opts = {}) => push({ tone: 'warning', message, ...opts }),
    }), [push, dismiss]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="toast-stack" role="region" aria-label="Notifications">
                {toasts.map((t) => {
                    const Icon = TONE_ICON[t.tone] || Info;
                    return (
                        <div
                            key={t.id}
                            className={`toast toast-${t.tone}`}
                            role={t.tone === 'error' ? 'alert' : 'status'}
                            aria-live={t.tone === 'error' ? 'assertive' : 'polite'}
                        >
                            <Icon size={18} className="toast-icon" aria-hidden="true" />
                            <div className="toast-body">
                                {t.title && <div className="toast-title">{t.title}</div>}
                                <div className="toast-message">{t.message}</div>
                            </div>
                            <button
                                type="button"
                                className="toast-close"
                                onClick={() => dismiss(t.id)}
                                aria-label="Dismiss notification"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        return {
            push: () => {},
            dismiss: () => {},
            success: () => {},
            error: () => {},
            info: () => {},
            warning: () => {},
        };
    }
    return ctx;
}
