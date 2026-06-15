import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Layout from '../admins/components/CityAdminDashboard/Layout/Layout';

const CityAdminDashboard = () => {
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/users')) return 'Users Management';
    if (path.includes('/gyms')) return 'Gyms Management';
    if (path.includes('/gym-owners')) return 'Gym Owner Requests';
    if (path.includes('/trainers')) return 'Trainers Management';
    if (path.includes('/dietitians')) return 'Dietitians Management';
    if (path.includes('/analytics')) return 'Analytics Overview';
    if (path.includes('/activity-logs')) return 'Activity Logs';
    if (path.includes('/settings')) return 'Account Settings';
    return 'City Admin Panel';
  };

  return (
    <Layout title={getTitle()}>
      <Outlet />
    </Layout>
  );
};

export default CityAdminDashboard;
