import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

const GymOwnersList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const owners = [
    { id: 'OWN-101', name: 'Rahul Bajaj', email: 'rahul.b@example.com', phone: '+91 9876543201', gyms: 2, kyc: 'Verified', status: 'Active' },
    { id: 'OWN-102', name: 'Vikram Singh', email: 'vikram.s@example.com', phone: '+91 9876543202', gyms: 1, kyc: 'Pending', status: 'Active' },
    { id: 'OWN-103', name: 'Neha Sharma', email: 'neha.s@example.com', phone: '+91 9876543203', gyms: 3, kyc: 'Rejected', status: 'Blocked' },
  ];

  const columns = [
    { title: 'Owner ID', key: 'id' },
    { 
      title: 'Name', 
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <div className="font-medium text-gray-900">{row.name}</div>
        </div>
      )
    },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { title: 'Gyms Owned', key: 'gyms' },
    { 
      title: 'KYC Status', 
      key: 'kyc',
      render: (row) => {
        const variants = { 'Verified': 'success', 'Pending': 'warning', 'Rejected': 'danger' };
        return <Badge label={row.kyc} variant={variants[row.kyc]} />;
      }
    },
    { 
      title: 'Account', 
      key: 'status',
      render: (row) => <Badge label={row.status} variant={row.status === 'Active' ? 'success' : 'danger'} />
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <Button variant="secondary" size="sm">View KYC</Button>
        </div>
      )
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Owners</h1>
          <p className="text-sm text-gray-500">Manage gym owners and verify KYC</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by owner name, email, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
        
        <Table data={owners} columns={columns} />
      </div>
    </div>
  );
};

export default GymOwnersList;
