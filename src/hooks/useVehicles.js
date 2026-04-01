import { useState, useEffect } from 'react'
import { vehicleService } from '../services/vehicleService'

/**
 * Hook to fetch and filter vehicles
 * @param {string|null} type - optional vehicle type filter
 */
export function useVehicles(type = null) {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        setLoading(true)
        const fetch = type
            ? vehicleService.getByType(type)
            : vehicleService.getAll()

        fetch
            .then(setVehicles)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [type])

    return { vehicles, loading, error }
}
