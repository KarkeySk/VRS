import { useState, useEffect } from 'react'
import { bookingService } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'

/** Hook to fetch the current user's bookings */
export function useMyBookings() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user) return
        let mounted = true;
        const load = async () => {
            setLoading(true)
            try {
                const data = await bookingService.getMyBookings(user.id);
                if (mounted) setBookings(data);
            } catch (err) {
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [user])

    return { bookings, loading, error }
}
