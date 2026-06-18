import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import UserDetails from './UserDetails';
import ConfirmationModal from '../../common/ConfirmationModal';
import { getAllUsers, updateSuperadminUser } from '../../../../services/superApi';

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      if (res.data && res.data.users) {
        const formattedUsers = res.data.users.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          status: u.status ? (u.status.charAt(0).toUpperCase() + u.status.slice(1)) : 'Active',
          joined: u.joinDate ? u.joinDate.substring(0, 10) : 'N/A'
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleBlockClick = (user) => {
    setUserToBlock(user);
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    try {
      const res = await updateSuperadminUser(userToBlock.id, { status: 'blocked' });
      if (res.data) {
        alert("User blocked successfully");
        fetchUsers();
      }
    } catch (err) {
      console.error("Error blocking user:", err);
    }
    setShowBlockModal(false);
  };

  const columns = [
    { 
      title: 'User', 
      key: 'name', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.id}</div>
          </div>
        </div>
      )
    },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { 
      title: 'Status', 
      key: 'status',
      render: (row) => {
        let variant = 'default';
        if (row.status === 'Active') variant = 'success';
        if (row.status === 'Blocked') variant = 'danger';
        if (row.status === 'Suspended') variant = 'warning';
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { title: 'Joined Date', key: 'joined' },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" onClick={() => handleViewProfile(row)}>View</Button>
           {row.status !== 'Blocked' && (
             <Button variant="danger" size="sm" onClick={() => handleBlockClick(row)}>Block</Button>
           )}
        </div>
      )
    },
  ];

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage all registered app users</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <Filter size={16} /> Filters
            </Button>
          </div>
        </div>
        
        <Table data={filteredUsers} columns={columns} />
        
        <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
          Showing 1-{filteredUsers.length} of {users.length} users
        </div>
      </div>

      {showDetails && (
        <UserDetails 
          isOpen={showDetails} 
          onClose={() => setShowDetails(false)} 
          user={selectedUser} 
        />
      )}

      <ConfirmationModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={confirmBlock}
        title="Block User"
        message={`Are you sure you want to block ${userToBlock?.name}? They will lose access to the app.`}
        dangerMode={true}
      />
    </div>
  );
};

export default UsersList;
