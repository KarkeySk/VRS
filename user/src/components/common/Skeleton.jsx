export function Skeleton({ width = '100%', height = 16, radius = 8, style, ...rest }) {
    return (
        <span
            className="skeleton-block"
            style={{
                display: 'inline-block',
                width,
                height,
                borderRadius: radius,
                ...style,
            }}
            aria-hidden="true"
            {...rest}
        />
    );
}

export function SkeletonText({ lines = 2, lastLineWidth = '70%', gap = 8 }) {
    return (
        <span style={{ display: 'flex', flexDirection: 'column', gap }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height={12}
                    width={i === lines - 1 ? lastLineWidth : '100%'}
                />
            ))}
        </span>
    );
}

export function VehicleCardSkeleton() {
    return (
        <div
            style={{
                background: 'var(--bg-card)',
                borderRadius: '24px',
                padding: '16px',
                border: '1px solid var(--border)',
            }}
            aria-hidden="true"
        >
            <Skeleton height={240} radius={16} style={{ marginBottom: 20, display: 'block' }} />
            <div style={{ padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={20} width={64} />
                </div>
                <Skeleton height={12} width="80%" style={{ marginBottom: 16, display: 'block' }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <Skeleton height={22} width={110} radius={20} />
                    <Skeleton height={22} width={110} radius={20} />
                </div>
                <Skeleton height={44} radius={12} style={{ display: 'block' }} />
            </div>
        </div>
    );
}

export function BookingRowSkeleton() {
    return (
        <div
            style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
            }}
            aria-hidden="true"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 300px' }}>
                <Skeleton width={80} height={56} radius={10} />
                <div style={{ flex: 1 }}>
                    <Skeleton height={14} width="60%" style={{ marginBottom: 8, display: 'block' }} />
                    <Skeleton height={11} width="40%" />
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Skeleton height={24} width={70} />
                <Skeleton height={32} width={84} radius={10} />
            </div>
        </div>
    );
}
