import { useEffect, useState } from 'react';
import { PaddockService } from '../services/PaddockService';
import { PaddockCar } from '../services/types';

export function useCar(paddockService: PaddockService, carId?: number) {
    const [car, setCar] = useState<PaddockCar | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!carId) return;

        let mounted = true;
        setLoading(true);

        paddockService.getCar(carId)
            .then(carData => {
                if (mounted) {
                    setCar(carData);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (mounted) {
                    setError(err);
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [paddockService, carId]);

    return { car, loading, error };
}
