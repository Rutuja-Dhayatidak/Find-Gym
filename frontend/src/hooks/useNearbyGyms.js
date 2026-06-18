import { useState, useCallback } from 'react';
import { getNearbyGyms } from '../userServices/gymApi';

// Custom hook to fetch and manage nearby gyms from API
export const useNearbyGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

  const fetchNearbyGyms = useCallback(async ({ lat, lng, radius, page, limit }) => {
    setLoading(true);
    setError(null);
    try {
      // Call the API function
      const data = await getNearbyGyms({ lat, lng, radius, page, limit });
      // Set gyms array and pagination from standard response format
      setGyms(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (err) {
      // Set local error message on failure
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    gyms,
    loading,
    error,
    pagination,
    fetchNearbyGyms,
  };
};
