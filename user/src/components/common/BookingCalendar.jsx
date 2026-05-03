import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calendarService } from '@bhatbhati/shared/services/calendarService.js';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const statusColors = {
    confirmed: '#34d399',
    approved: '#60bb46',
    submitted: '#3b82f6',
    'under-review': '#f59e0b',
};

function buildGrid(year, month, bookedDays) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const now = new Date();
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push({ day: null });

    for (let d = 1; d <= daysInMonth; d++) {
        const bookings = bookedDays.filter((b) => b.day === d);
        cells.push({
            day: d,
            isToday: year === now.getFullYear() && month === now.getMonth() && d === now.getDate(),
            bookings,
        });
    }
    return cells;
}

export default function BookingCalendar() {
    const { user } = useAuth();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [bookedDays, setBookedDays] = useState([]);
    const [hoveredDay, setHoveredDay] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        calendarService.getUserBookedDates(user.id, year, month)
            .then(setBookedDays)
            .catch(() => setBookedDays([]));
    }, [user?.id, year, month]);

    const cells = buildGrid(year, month, bookedDays);

    const prev = () => {
        if (month === 0) { setMonth(11); setYear((y) => y - 1); }
        else setMonth((m) => m - 1);
    };
    const next = () => {
        if (month === 11) { setMonth(0); setYear((y) => y + 1); }
        else setMonth((m) => m + 1);
    };

    return (
        <div style={{
            background: 'var(--bg-card)', borderRadius: '22px', border: '1px solid var(--border)',
            padding: '28px',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
            }}>
                <div>
                    <div style={{
                        fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase',
                        letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '6px',
                    }}>My Calendar</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                        {MONTH_NAMES[month]} {year}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={prev} style={{
                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                        borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)',
                    }}><ChevronLeft size={14} /></button>
                    <button onClick={next} style={{
                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                        borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)',
                    }}><ChevronRight size={14} /></button>
                </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {DAY_LABELS.map((d, i) => (
                    <div key={i} style={{
                        textAlign: 'center', fontSize: '0.65rem', fontWeight: '700',
                        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{d}</div>
                ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', position: 'relative' }}>
                {cells.map((cell, i) => {
                    if (cell.day === null) return <div key={i} style={{ aspectRatio: '1' }} />;

                    const hasBooking = cell.bookings.length > 0;
                    const mainStatus = hasBooking ? cell.bookings[0].status : null;
                    const dotColor = statusColors[mainStatus] || '#e8732a';

                    return (
                        <div
                            key={i}
                            onMouseEnter={() => hasBooking && setHoveredDay(cell.day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            style={{
                                aspectRatio: '1', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', borderRadius: '10px',
                                fontSize: '0.8rem', fontWeight: cell.isToday || hasBooking ? '700' : '400',
                                cursor: hasBooking ? 'pointer' : 'default',
                                position: 'relative',
                                color: cell.isToday ? 'var(--accent-ink)' : hasBooking ? dotColor : 'var(--text-secondary)',
                                background: cell.isToday
                                    ? 'var(--brand-gradient)'
                                    : hasBooking
                                        ? `${dotColor}12`
                                        : 'transparent',
                                border: hasBooking && !cell.isToday ? `1px solid ${dotColor}30` : '1px solid transparent',
                                transition: 'all 0.15s',
                            }}
                        >
                            {cell.day}
                            {hasBooking && !cell.isToday && (
                                <span style={{
                                    width: '4px', height: '4px', borderRadius: '50%',
                                    background: dotColor, marginTop: '2px',
                                }} />
                            )}
                            {/* Tooltip */}
                            {hoveredDay === cell.day && hasBooking && (
                                <div style={{
                                    position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
                                    transform: 'translateX(-50%)', background: '#1a1a1a',
                                    border: '1px solid var(--border)', borderRadius: '8px',
                                    padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 10,
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                                }}>
                                    {cell.bookings.map((b, j) => (
                                        <div key={j} style={{ fontSize: '0.65rem', color: 'var(--text-primary)', marginBottom: j < cell.bookings.length - 1 ? '4px' : 0 }}>
                                            <span style={{ color: statusColors[b.status] || '#e8732a', fontWeight: '700' }}>{b.vehicleName}</span>
                                            <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex', gap: '14px', marginTop: '16px', paddingTop: '12px',
                borderTop: '1px solid var(--border)', flexWrap: 'wrap',
            }}>
                {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
