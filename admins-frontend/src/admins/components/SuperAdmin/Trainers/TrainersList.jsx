import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

const TrainersList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const trainers = [
    { id: 'TRN-201', name: 'Kabir Singh', email: 'kabir@example.com', gym: 'Gold\'s Gym Elite', status: 'Verified', rating: 4.8 },
    { id: 'TRN-202', name: 'Ayesha Takia', email: 'ayesha@example.com', gym: 'Independent', status: 'Pending', rating: 4.5 },
    { id: 'TRN-203', name: 'John Doe', email: 'john@example.com', gym: 'Titan Fitness', status: 'Verified', rating: 4.9 },
  ];

  const columns = [
    { title: 'Trainer ID', key: 'id' },
    { 
      title: 'Trainer', 
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { title: 'Associated Gym', key: 'gym' },
    { 
      title: 'Verification', 
      key: 'status',
      render: (row) => {
        const variants = { 'Verified': 'success', 'Pending': 'warning', 'Rejected': 'danger' };
        return <Badge label={row.status} variant={variants[row.status]} />;
      }
    },
    { 
      title: 'Rating', 
      key: 'rating',
      render: (row) => <span className="text-yellow-500 font-medium">★ {row.rating}</span>
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <Button variant="secondary" size="sm">View</Button>
        </div>
      )
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
          <p className="text-sm text-gray-500">Manage trainers and verify certifications</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search trainers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
        <Table data={trainers} columns={columns} />
      </div>
    </div>
  );
};

export default TrainersList;
