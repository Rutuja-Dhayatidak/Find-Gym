import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/city-admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/city-admin/users', icon: '👥' },
    { name: 'Gyms', path: '/city-admin/gyms', icon: '🏢' },
    { name: 'Gym Owner Requests', path: '/city-admin/gym-owners', icon: '📝' },
    { name: 'Trainers', path: '/city-admin/trainers', icon: '🏋️' },
    { name: 'Dietitians', path: '/city-admin/dietitians', icon: '🥗' },
    { name: 'Health Stores', path: '/city-admin/health-stores', icon: '🏪' },
    { name: 'Product Approvals', path: '/city-admin/health-stores/approvals', icon: '🍏' },
    { name: 'Analytics', path: '/city-admin/analytics', icon: '📈' },
    { name: 'Activity Logs', path: '/city-admin/activity-logs', icon: '📜' },
    { name: 'Settings', path: '/city-admin/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-lg transition-all duration-300">
      <div className="p-6 border-b border-slate-700 flex items-center justify-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
          livesale.Fitness Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          let isActive = false;
          if (item.path === '/city-admin/health-stores') {
            isActive = location.pathname === '/city-admin/health-stores' ||
              (location.pathname.startsWith('/city-admin/health-stores/') && !location.pathname.includes('/approvals'));
          } else {
            isActive = location.pathname.startsWith(item.path);
          }
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
