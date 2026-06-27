import React, { useState, useEffect } from 'react';
import { getUserActivity } from '../../../../services/cityAdminApi';

const UserActivity = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 10 });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await getUserActivity(userId, { page: pagination.currentPage, limit: pagination.limit });
        if (response.success) {
          setActivities(response.data.activities);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [userId, pagination.currentPage, pagination.limit]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getIcon = (type) => {
    if (type.includes('login')) return '🔑';
    if (type.includes('booking')) return '📅';
    if (type.includes('payment')) return '💳';
    if (type.includes('profile')) return '👤';
    return '📝';
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-center py-8 text-slate-500">No activity recorded for this user yet.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
        {activities.map(activity => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-[35px] bg-white border-2 border-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm">
              {getIcon(activity.type)}
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-slate-800">{activity.description}</p>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-2">{activity.type.replace(/_/g, ' ')}</p>
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6 pt-4 border-t">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-slate-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserActivity;
