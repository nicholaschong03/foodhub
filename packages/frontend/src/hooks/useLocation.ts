import { useState, useEffect } from 'react';

interface Location {
    latitude: number;
    longitude: number;
}

interface UseLocationReturn {
    location: Location | null;
    error: string | null;
    loading: boolean;
    refreshLocation: () => void;
}

export function useLocation(): UseLocationReturn {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const getLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLoading(false);
            },
            (error) => {
                setError(error.message);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    useEffect(() => {
        getLocation();
    }, []);

    return {
        location,
        error,
        loading,
        refreshLocation: getLocation,
    };
}