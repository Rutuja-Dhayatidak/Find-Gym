import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import CreateAdmin from './CreateAdmin';
import ConfirmationModal from '../../common/ConfirmationModal';
import { apiPath } from '../../../../services/config';

const AdminsList = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(apiPath('/admins/all'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(apiPath(`/admins/${adminToDelete._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        <Badge label={row.status} variant={row.status === 'Active' ? 'success' : row.status === 'Suspended' ? 'danger' : 'default'} />
      )
    },
    { 
      title: 'Role', 
      key: 'adminType',
      render: (row) => {
        let displayRole = row.adminType;
        if (row.adminType === 'platform_admin' || row.adminType === 'Platform Admin') displayRole = 'Platform Admin';
        else if (row.adminType === 'city_admin' || row.adminType === 'City Admin') displayRole = 'City Admin';
        return <span className="text-gray-500">{displayRole}</span>;
      }
    },
    {
      title: 'City / Assigned City',
      key: 'assignedCities',
      render: (row) => {
        const cityStr = row.assignedCities && row.assignedCities.length > 0
          ? row.assignedCities.join(', ')
          : (row.city || '-');
        return <span className="text-gray-500">{cityStr}</span>;
      }
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => {
        const handleToggleStatus = async () => {
          const newStatus = row.status === 'Active' ? 'Suspended' : 'Active';
          if (!window.confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'suspend'} this admin?`)) return;
          try {
            const token = localStorage.getItem('superAdminToken');
            const response = await fetch(apiPath(`/admins/${row._id}`), {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (response.ok && data.success) {
              fetchAdmins();
            } else {
              alert(data.message || 'Failed to update admin status');
            }
          } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
          }
        };

        return (
          <div className="flex gap-2">
             <Button variant="secondary" size="sm">Edit</Button>
             <Button variant="secondary" size="sm" onClick={handleToggleStatus}>
               {row.status === 'Active' ? 'Suspend' : 'Activate'}
             </Button>
             <Button variant="danger" size="sm" onClick={() => handleDelete(row)}>Delete</Button>
          </div>
        );
      }
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
