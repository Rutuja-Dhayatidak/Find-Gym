import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from './admins/components/SuperAdmin/SuperAdminLayout';

import Dashboard from './admins/components/SuperAdmin/Dashboard/Dashboard';
import UsersList from './admins/components/SuperAdmin/Users/UsersList';
import AdminsList from './admins/components/SuperAdmin/Admins/AdminsList';
import GymsList from './admins/components/SuperAdmin/Gyms/GymsList';
import GymOwnersList from './admins/components/SuperAdmin/GymOwners/GymOwnersList';
import TrainersList from './admins/components/SuperAdmin/Trainers/TrainersList';
import DietitiansList from './admins/components/SuperAdmin/Dietitians/DietitiansList';
import Payments from './admins/components/SuperAdmin/Payments/Payments';
import CMSManagement from './admins/components/SuperAdmin/CMS/CMSManagement';
import SetupPassword from './admins/pages/SetupPassword';
import Login from './admins/pages/Login';

// Platform Admin Imports
import PlatformAdminDashboard from './pages/PlatformAdminDashboard';
import PADashboard from './admins/components/PlatformAdmin/Dashboard/Dashboard';
import PAUsersList from './admins/components/PlatformAdmin/Users/UsersList';
import PAGymsList from './admins/components/PlatformAdmin/Gyms/GymsList';
import PAGymOwnersList from './admins/components/PlatformAdmin/GymOwners/GymOwnersList';
import PATrainersList from './admins/components/PlatformAdmin/Trainers/TrainersList';
import PATransactionHistory from './admins/components/PlatformAdmin/Payments/TransactionHistory';
import PARevenueReports from './admins/components/PlatformAdmin/Payments/RevenueReports';
import PAPayoutManagement from './admins/components/PlatformAdmin/Payments/PayoutManagement';
import PAGymCategories from './admins/components/PlatformAdmin/CMS/GymCategories';

// City Admin Imports
import CityAdminDashboard from './pages/CityAdminDashboard';
import CADashboard from './admins/components/CityAdminDashboard/Dashboard/Dashboard';
import CAUsersList from './admins/components/CityAdminDashboard/Users/UsersList';
import CAGymsList from './admins/components/CityAdminDashboard/Gyms/GymsList';
import CATrainersList from './admins/components/CityAdminDashboard/Trainers/TrainersList';
import CADietitiansList from './admins/components/CityAdminDashboard/Dietitians/DietitiansList';
import CAAnalytics from './admins/components/CityAdminDashboard/Analytics/Analytics';
import CAActivityLogs from './admins/components/CityAdminDashboard/ActivityLogs/ActivityLogs';
import CASettings from './admins/components/CityAdminDashboard/Settings/Settings';
import CAGymOwnersList from './admins/components/CityAdminDashboard/GymOwners/GymOwnersList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin/setup-password" element={<SetupPassword />} />
        
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="admins" element={<AdminsList />} />
          <Route path="gyms" element={<GymsList />} />
          <Route path="gym-owners" element={<GymOwnersList />} />
          <Route path="trainers" element={<TrainersList />} />
          <Route path="dietitians" element={<DietitiansList />} />
          <Route path="payments" element={<Payments />} />
          <Route path="cms" element={<CMSManagement />} />
        </Route>

        <Route path="/platform-admin" element={<PlatformAdminDashboard />}>
          <Route path="dashboard" element={<PADashboard />} />
          <Route path="users" element={<PAUsersList />} />
          <Route path="gyms" element={<PAGymsList />} />
          <Route path="gym-owners" element={<PAGymOwnersList />} />
          <Route path="trainers" element={<PATrainersList />} />
          <Route path="payments">
            <Route index element={<PATransactionHistory />} />
            <Route path="history" element={<PATransactionHistory />} />
            <Route path="revenue" element={<PARevenueReports />} />
            <Route path="payouts" element={<PAPayoutManagement />} />
          </Route>
          {/* Using CMS component from super admin temporarily if not specified, otherwise map to correct CMS */}
          <Route path="cms">
            <Route index element={<CMSManagement />} />
            <Route path="gym-categories" element={<PAGymCategories />} />
          </Route>
        </Route>

        <Route path="/city-admin" element={<CityAdminDashboard />}>
          <Route path="dashboard" element={<CADashboard />} />
          <Route path="users" element={<CAUsersList />} />
          <Route path="gyms" element={<CAGymsList />} />
          <Route path="gym-owners" element={<CAGymOwnersList />} />
          <Route path="trainers" element={<CATrainersList />} />
          <Route path="dietitians" element={<CADietitiansList />} />
          <Route path="analytics" element={<CAAnalytics />} />
          <Route path="activity-logs" element={<CAActivityLogs />} />
          <Route path="settings" element={<CASettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
