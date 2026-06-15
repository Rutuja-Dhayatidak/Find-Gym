import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../../../services/superApi';
import { Users, Dumbbell, IndianRupee, Calendar } from 'lucide-react';

const KPICards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpis = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-orange-100', growth: '+12%', isPositive: true },
    { title: 'Total Gyms', value: stats?.totalGyms || 0, icon: Dumbbell, color: 'text-primary', bg: 'bg-orange-100', growth: '+5%', isPositive: true },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-primary', bg: 'bg-orange-100', growth: '+18%', isPositive: true },
    { title: 'Active Bookings', value: stats?.activeBookings || 0, icon: Calendar, color: 'text-primary', bg: 'bg-orange-100', growth: '-2%', isPositive: false },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-32 animate-pulse flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${kpi.bg}`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-semibold ${kpi.isPositive ? 'text-green-600' : 'text-red-500'} mr-2`}>
              {kpi.growth}
            </span>
            <span className="text-sm text-gray-500">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
