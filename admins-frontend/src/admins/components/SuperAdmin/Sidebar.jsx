import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  MapPin, 
  Dumbbell, 
  UserSquare2,
  Activity,
  Apple,
  CreditCard,
  LayoutTemplate,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { name: 'Users', icon: Users, path: '/super-admin/users' },
    { name: 'Admins', icon: Shield, path: '/super-admin/admins' },
    { name: 'Gyms', icon: Dumbbell, path: '/super-admin/gyms' },
    { name: 'Gym Owners', icon: UserSquare2, path: '/super-admin/gym-owners' },
    { name: 'Trainers', icon: Activity, path: '/super-admin/trainers' },
    { name: 'Dietitians', icon: Apple, path: '/super-admin/dietitians' },
    { name: 'Payments', icon: CreditCard, path: '/super-admin/payments' },
    { name: 'CMS', icon: LayoutTemplate, path: '/super-admin/cms' },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center font-bold text-lg">
            A
          </div>
          <span className="font-bold text-lg text-gray-800">Super Admin</span>
        </div>
        <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/super-admin'}
              className={({ isActive }) => 
                `flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                  isActive 
                    ? 'bg-orange-50 border-primary text-primary' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                }`
              }
            >
              <item.icon size={18} className="mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-danger hover:bg-red-50 rounded-md transition-colors">
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
