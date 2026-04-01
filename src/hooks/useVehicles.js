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
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const data = await (type ? vehicleService.getByType(type) : vehicleService.getAll());
                if (mounted) setVehicles(data);
            } catch (err) {
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [type])

    return { vehicles, loading, error }
}
