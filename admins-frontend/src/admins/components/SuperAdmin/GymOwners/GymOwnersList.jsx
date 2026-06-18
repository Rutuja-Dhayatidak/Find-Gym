import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import { getAllGymOwners } from '../../../../services/superApi';

const GymOwnersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await getAllGymOwners();
      if (res.data && res.data.owners) {
        const formattedOwners = res.data.owners.map(o => ({
          id: o._id,
          name: o.name,
          email: o.email,
          phone: o.phone || 'N/A',
          gyms: o.gyms ? o.gyms.length : 0,
          kyc: o.kyc?.verified ? 'Verified' : 'Pending',
          status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1)) : 'Pending'
        }));
        setOwners(formattedOwners);
      }
    } catch (err) {
      console.error("Failed to load owners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const columns = [
    { title: 'Owner ID', key: 'id' },
    { 
      title: 'Name', 
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
            {row.name ? row.name.charAt(0) : '?'}
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
        return <Badge label={row.kyc} variant={variants[row.kyc] || 'default'} />;
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

  const filteredOwners = owners.filter(owner => 
    owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        
        <Table data={filteredOwners} columns={columns} />
      </div>
    </div>
  );
};

export default GymOwnersList;
