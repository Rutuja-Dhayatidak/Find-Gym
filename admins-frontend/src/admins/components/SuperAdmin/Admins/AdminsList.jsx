import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import CreateAdmin from './CreateAdmin';
import ConfirmationModal from '../../common/ConfirmationModal';

const AdminsList = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/admins/all`);
      const data = await response.json();
      if (response.ok && data.success) {
        setAdmins(data.admins);
      } else {
        console.error('Failed to fetch admins:', data.message);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
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
    if (!adminToDelete) return;
    
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/admins/${adminToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Remove from list
        setAdmins(prev => prev.filter(a => a._id !== adminToDelete._id));
      } else {
        alert(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Network error occurred');
    }
    
    setShowDelete(false);
    setAdminToDelete(null);
  };

  const columns = [
    { 
      title: 'Admin ID', 
      key: 'id',
      render: (row) => <span className="text-gray-500 text-xs">{row._id?.substring(0, 8)}...</span>
    },
    { 
      title: 'Name', 
      key: 'fullName',
      render: (row) => (
        <div className="font-medium text-gray-900">{row.fullName}</div>
      )
    },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { 
      title: 'Status', 
      key: 'status',
      render: (row) => (
        <Badge label={row.status} variant={row.status === 'Active' ? 'success' : 'default'} />
      )
    },
    { 
      title: 'Role', 
      key: 'adminType',
      render: (row) => <span className="text-gray-500">{row.adminType}</span>
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <Button variant="secondary" size="sm">Edit</Button>
           <Button variant="danger" size="sm" onClick={() => handleDelete(row)}>Delete</Button>
        </div>
      )
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admins</h1>
          <p className="text-sm text-gray-500">Manage system administrators</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Create New Admin
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading admins...</div>
        ) : admins.length > 0 ? (
          <Table data={admins} columns={columns} />
        ) : (
          <div className="p-8 text-center text-gray-500">No admins found. Create one to get started.</div>
        )}
      </div>

      {showCreate && (
        <CreateAdmin 
          isOpen={showCreate} 
          onClose={() => setShowCreate(false)} 
          onSuccess={fetchAdmins} // Refresh list after creation
        />
      )}

      <ConfirmationModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete ${adminToDelete?.fullName}? This action cannot be undone.`}
        dangerMode={true}
      />
    </div>
  );
};

export default AdminsList;
