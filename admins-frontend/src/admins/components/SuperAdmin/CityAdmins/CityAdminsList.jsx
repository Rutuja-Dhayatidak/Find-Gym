import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import CreateCityAdmin from './CreateCityAdmin';
import ConfirmationModal from '../../common/ConfirmationModal';

const CityAdminsList = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [cityAdmins, setCityAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get(`${baseUrl}/api/admins/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        const filtered = response.data.admins.filter(a => a.adminType === 'city_admin');
        setCityAdmins(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = (admin) => {
    setAdminToDelete(admin);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const token = localStorage.getItem('superAdminToken');
      await axios.delete(`${baseUrl}/api/admins/${adminToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('City Admin deleted successfully');
      fetchAdmins();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
    setShowDelete(false);
  };

  const columns = [
    { title: 'Admin ID', key: '_id' },
    { 
      title: 'Name', 
      key: 'fullName',
      render: (row) => <div className="font-medium text-gray-900">{row.fullName}</div>
    },
    { title: 'Email', key: 'email' },
    { 
      title: 'Assigned Cities', 
      key: 'assignedCities',
      render: (row) => (
        <div className="flex gap-1 flex-wrap max-w-xs">
          {row.assignedCities && row.assignedCities.slice(0, 3).map(city => (
            <Badge key={city} label={city} variant="info" className="bg-blue-100 text-blue-800" />
          ))}
          {row.assignedCities && row.assignedCities.length > 3 && (
            <Badge label={`+${row.assignedCities.length - 3} more`} variant="default" />
          )}
        </div>
      )
    },
    { 
      title: 'Status', 
      key: 'status',
      render: (row) => (
        <Badge label={row.status} variant={row.status === 'Active' ? 'success' : 'default'} />
      )
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <Button variant="danger" size="sm" onClick={() => handleDelete(row)}>Delete</Button>
        </div>
      )
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">City Admins</h1>
          <p className="text-sm text-gray-500">Manage region-specific administrators</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Create City Admin
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-500 font-medium">Loading City Admins...</div>
        ) : (
          <Table data={cityAdmins} columns={columns} />
        )}
      </div>

      {showCreate && (
        <CreateCityAdmin isOpen={showCreate} onClose={() => setShowCreate(false)} />
      )}

      <ConfirmationModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title="Delete City Admin"
        message={`Are you sure you want to delete ${adminToDelete?.fullName}? This action cannot be undone.`}
        dangerMode={true}
      />
    </div>
  );
};

export default CityAdminsList;
