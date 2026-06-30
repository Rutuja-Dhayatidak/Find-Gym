import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const [cmsOpen, setCmsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/platform-admin/dashboard', icon: '📊' },
    { name: 'City Admins', path: '/platform-admin/city-admins', icon: '🏙️' },
    { name: 'Users', path: '/platform-admin/users', icon: '👥' },
    { name: 'Gyms', path: '/platform-admin/gyms', icon: '🏢' },
    { name: 'Gym Owners', path: '/platform-admin/gym-owners', icon: '💼' },
    { name: 'Trainers', path: '/platform-admin/trainers', icon: '🏋️' },
    { name: 'Payments', path: '/platform-admin/payments', icon: '💳' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-lg transition-all duration-300">
      <div className="p-6 border-b border-slate-700 flex items-center justify-center shrink-0">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
          livesale.Fitness Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
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
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* Expandable CMS Menu */}
        <div>
          <button
            onClick={() => {
              setCmsOpen(!cmsOpen);
              navigate('/platform-admin/cms');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname.startsWith('/platform-admin/cms')
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl group-hover:scale-110 transition-transform">🖼️</span>
              <span className="font-medium">CMS</span>
            </div>
            <span className={`transform transition-transform ${cmsOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {/* Submenu */}
          {cmsOpen && (
            <div className="ml-12 mt-2 flex flex-col space-y-1">
              <Link
                to="/platform-admin/cms"
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${location.pathname === '/platform-admin/cms'
                    ? 'text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                Home Page Banners
              </Link>
              <Link
                to="/platform-admin/cms/mobile-app-banners"
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${location.pathname === '/platform-admin/cms/mobile-app-banners'
                    ? 'text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                Mobile App Banners
              </Link>
              <Link
                to="/platform-admin/cms/gym-categories"
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${location.pathname === '/platform-admin/cms/gym-categories'
                    ? 'text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                Gym Categories
              </Link>
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t border-slate-700 shrink-0">
        <button className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 px-4 py-2 rounded-lg transition-colors duration-200" onClick={() => {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        }}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
