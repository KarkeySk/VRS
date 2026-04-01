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
        setLoading(true)
        bookingService.getMyBookings(user.id)
            .then(setBookings)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [user])

    return { bookings, loading, error }
}
