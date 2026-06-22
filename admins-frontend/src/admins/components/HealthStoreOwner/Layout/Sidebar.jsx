import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getOrders } from '../../../../services/healthStoreOwnerApi';

const Sidebar = () => {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const navItems = [
    { name: 'Dashboard', path: '/health-store-owner/dashboard', icon: '📊' },
    { name: 'Store Profile', path: '/health-store-owner/profile', icon: '🏪' },
    { name: 'Diet Plans & Foods', path: '/health-store-owner/diet-foods', icon: '🥗' },
    { name: 'Supplements', path: '/health-store-owner/supplements', icon: '💊' },
    { name: 'Orders List', path: '/health-store-owner/orders', icon: '📦' },
  ];

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await getOrders({ status: 'Pending', limit: 100 });
        if (res.data && res.data.data) {
          const viewedIds = JSON.parse(localStorage.getItem('viewedOrderIds') || '[]');
          const unviewed = res.data.data.filter(order => !viewedIds.includes(order._id));
          setPendingCount(unviewed.length);
        }
      } catch (err) {
        console.error('Failed to fetch pending orders count', err);
      }
    };
    fetchPendingOrders();

    // Listen to orders-viewed event to update immediately
    window.addEventListener('orders-viewed', fetchPendingOrders);

    // Poll every 30 seconds for new orders
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('orders-viewed', fetchPendingOrders);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hsOwnerToken');
    localStorage.removeItem('hsOwner');
    localStorage.removeItem('hsStore');
    window.location.href = '/health-store-owner/login';
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-lg transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-center gap-2">
        <span className="text-2xl">🏪</span>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
          Store Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/health-store-owner/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {item.name === 'Orders List' && pendingCount > 0 && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm ${
                  isActive ? 'bg-white text-red-600 animate-pulse' : 'bg-red-600 text-white animate-pulse'
                }`}>
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-slate-850 hover:bg-red-500 hover:text-white text-slate-300 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
