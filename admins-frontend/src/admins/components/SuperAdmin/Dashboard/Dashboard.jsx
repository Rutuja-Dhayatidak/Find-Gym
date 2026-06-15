import React from 'react';
import KPICards from './KPICards';
import Charts from './Charts';
import QuickStats from './QuickStats';
import RecentActivities from './RecentActivities';

const Dashboard = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Monitor key metrics and recent activities</p>
      </div>

      <KPICards />
      <Charts />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickStats />
        </div>
        <div>
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
