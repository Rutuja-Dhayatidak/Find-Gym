import React from 'react';
import Table from '../../common/Table';

const QuickStats = () => {
  const topGyms = [
    { id: 1, name: 'Gold\'s Gym Elite', members: 1250, rating: 4.8, revenue: '₹4.5L' },
    { id: 2, name: 'CureFit Pro', members: 980, rating: 4.6, revenue: '₹3.2L' },
    { id: 3, name: 'Iron Paradise', members: 850, rating: 4.9, revenue: '₹3.0L' },
    { id: 4, name: 'Anytime Fitness', members: 720, rating: 4.5, revenue: '₹2.5L' },
    { id: 5, name: 'Core Athletics', members: 690, rating: 4.7, revenue: '₹2.1L' },
  ];

  const columns = [
    { title: 'Gym Name', key: 'name', sortable: true },
    { title: 'Members', key: 'members', sortable: true },
    { 
      title: 'Rating', 
      key: 'rating',
      render: (row) => <span className="text-yellow-500 font-medium">★ {row.rating}</span>
    },
    { title: 'Monthly Revenue', key: 'revenue', sortable: true },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Top Performing Gyms</h3>
      </div>
      <Table data={topGyms} columns={columns} />
    </div>
  );
};

export default QuickStats;
