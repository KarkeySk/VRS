import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, CreditCard, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '@bhatbhati/shared/services/notificationService.js';

const typeIcons = {
    booking_approved: { Icon: CheckCircle, color: '#34d399' },
    booking_rejected: { Icon: XCircle, color: '#ef4444' },
    payment_success: { Icon: CreditCard, color: '#60bb46' },
    payment_failed: { Icon: CreditCard, color: '#ef4444' },
    general: { Icon: Info, color: '#3b82f6' },
};

export default function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Load notifications
    useEffect(() => {
        if (!user?.id) return;
        const load = async () => {
            try {
                const [items, count] = await Promise.all([
                    notificationService.getAll(user.id),
                    notificationService.getUnreadCount(user.id),
                ]);
                setNotifications(items);
                setUnreadCount(count);
            } catch { /* silent */ }
        };
        load();

        // Subscribe to realtime notifications
        const unsub = notificationService.subscribe(user.id, (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
            setUnreadCount((c) => c + 1);
        });
        return unsub;
    }, [user?.id]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = async (notif) => {
        if (!notif.is_read) {
            await notificationService.markAsRead(notif.id).catch(() => {});
            setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
            setUnreadCount((c) => Math.max(0, c - 1));
        }
        setOpen(false);
        if (notif.application_id) {
            if (notif.type === 'booking_approved') navigate(`/payment/${notif.application_id}`);
            else navigate(`/booking/confirm/${notif.application_id}`);
        }
    };

    const markAllRead = async () => {
        if (!user?.id) return;
        await notificationService.markAllAsRead(user.id).catch(() => {});
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const formatNotificationTime = (date) => {
        const createdAt = new Date(date);
        if (Number.isNaN(createdAt.getTime())) return '';
        return createdAt.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!user) return null;

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '38px', height: '38px', background: 'var(--bg-glass)',
                    border: '1px solid var(--border)', borderRadius: '999px', cursor: 'pointer',
                    color: 'var(--text-primary)', position: 'relative',
                    transition: 'border-color 0.25s',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(232, 115, 42, 0.3)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
                <Bell size={15} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-2px', right: '-2px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: '#ef4444', color: '#fff', fontSize: '0.6rem',
                        fontWeight: '800', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', border: '2px solid var(--bg-primary)',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: '340px', maxHeight: '420px', overflowY: 'auto',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    zIndex: 100,
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 16px', borderBottom: '1px solid var(--border)',
                    }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.85rem' }}>
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{
                                background: 'none', border: 'none', color: '#e8732a',
                                fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer',
                            }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const t = typeIcons[n.type] || typeIcons.general;
                            const TypeIcon = t.Icon;
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    style={{
                                        display: 'flex', gap: '12px', padding: '12px 16px',
                                        cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        background: n.is_read ? 'transparent' : 'rgba(232,115,42,0.03)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(232,115,42,0.03)'}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: `${t.color}15`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <TypeIcon size={14} color={t.color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            marginBottom: '2px',
                                        }}>
                                            <span style={{
                                                color: 'var(--text-primary)', fontSize: '0.78rem',
                                                fontWeight: n.is_read ? '500' : '700',
                                            }}>{n.title}</span>
                                            {!n.is_read && <span style={{
                                                width: '6px', height: '6px', borderRadius: '50%',
                                                background: '#e8732a', flexShrink: 0,
                                            }} />}
                                        </div>
                                        <p style={{
                                            color: 'var(--text-secondary)', fontSize: '0.7rem',
                                            margin: 0, lineHeight: 1.4,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>{n.message}</p>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginTop: '4px', display: 'block' }}>
                                            {formatNotificationTime(n.created_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
