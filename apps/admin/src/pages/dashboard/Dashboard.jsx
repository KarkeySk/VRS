import { useEffect, useState } from 'react'
import { vehicleService } from '@bhatbhati/shared/services/vehicleService.js'
import { bookingService } from '@bhatbhati/shared/services/bookingService.js'

export default function Dashboard() {
  const [stats, setStats] = useState({ vehicles: 0, bookings: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [vehicles, bookings] = await Promise.all([
          vehicleService.getAll(),
          bookingService.getAll(),
        ])
        setStats({
          vehicles: vehicles?.length ?? 0,
          bookings: bookings?.length ?? 0,
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
      }
    }
    loadStats()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      fontFamily: "'Inter', sans-serif", padding: '40px',
    }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{
          background: '#111', borderRadius: '14px', padding: '24px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Vehicles</p>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: '#e8732a', marginTop: '8px' }}>{stats.vehicles}</p>
        </div>

        <div style={{
          background: '#111', borderRadius: '14px', padding: '24px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Bookings</p>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: '#7b81ff', marginTop: '8px' }}>{stats.bookings}</p>
        </div>
      </div>
    </div>
  )
}
