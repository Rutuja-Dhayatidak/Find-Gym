import React, { useState, useEffect } from 'react';
import { Search, Filter, Dumbbell } from 'lucide-react';
import Table from '../../common/Table';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import GymDetails from './GymDetails';
import ConfirmationModal from '../../common/ConfirmationModal';
import { getAllGyms, updateSuperadminGym } from '../../../../services/superApi';

const GymsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGym, setSelectedGym] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [gymToSuspend, setGymToSuspend] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const res = await getAllGyms();
      if (res.data && res.data.gyms) {
        const formattedGyms = res.data.gyms.map(g => {
          let status = 'Pending';
          if (g.verified) {
            status = g.active ? 'Approved' : 'Suspended';
          } else if (g.active === false) {
            status = 'Suspended';
          }
          return {
            id: g._id,
            name: g.name,
            city: g.location?.city || 'N/A',
            owner: g.ownerId?.name || 'N/A',
            members: g.currentMembers || 0,
            revenue: g.monthlyRevenue ? `₹${g.monthlyRevenue}` : '₹0',
            status: status,
            raw: g
          };
        });
        setUsersData(formattedGyms); // Wait! Let's call it setGyms(formattedGyms);
      }
    } catch (err) {
      console.error("Failed to load gyms:", err);
    } finally {
      setLoading(false);
    }
  };

  const setUsersData = (data) => {
    setGyms(data);
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleView = (gym) => {
    setSelectedGym(gym);
    setShowDetails(true);
  };

  const handleSuspend = (gym) => {
    setGymToSuspend(gym);
    setShowSuspendModal(true);
  };

  const confirmSuspend = async () => {
    try {
      const res = await updateSuperadminGym(gymToSuspend.id, { active: false });
      if (res.data) {
        alert("Gym suspended successfully");
        fetchGyms();
      }
    } catch (err) {
      console.error("Error suspending gym:", err);
    }
    setShowSuspendModal(false);
  };

  const columns = [
    { 
      title: 'Gym', 
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-primary">
            <Dumbbell size={20} />
          </div>
          <div className="font-medium text-gray-900 hover:text-primary cursor-pointer" onClick={() => handleView(row)}>
            {row.name}
          </div>
        </div>
      )
    },
    { title: 'City', key: 'city' },
    { title: 'Owner Name', key: 'owner' },
    { title: 'Members', key: 'members' },
    { title: 'Revenue', key: 'revenue' },
    { 
      title: 'Status', 
      key: 'status',
      render: (row) => {
        const variants = {
          'Approved': 'success',
          'Pending': 'warning',
          'Suspended': 'danger',
          'Rejected': 'default'
        };
        return <Badge label={row.status} variant={variants[row.status]} />;
      }
    },
    { 
      title: 'Actions', 
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" onClick={() => handleView(row)}>View</Button>
           {row.status === 'Approved' && (
             <Button variant="danger" size="sm" onClick={() => handleSuspend(row)}>Suspend</Button>
           )}
        </div>
      )
    },
  ];

  const filteredGyms = gyms.filter(gym => 
    gym.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.city?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Gyms</h1>
          <p className="text-sm text-gray-500">Manage partner gyms and fitness centers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by gym name, owner, city..." 
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
        
        <Table data={filteredGyms} columns={columns} />
      </div>

      {showDetails && (
        <GymDetails isOpen={showDetails} onClose={() => setShowDetails(false)} gym={selectedGym} />
      )}

      <ConfirmationModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={confirmSuspend}
        title="Suspend Gym"
        message={`Are you sure you want to suspend ${gymToSuspend?.name}? Users will not be able to book sessions.`}
        dangerMode={true}
      />
    </div>
  );
};

export default GymsList;
