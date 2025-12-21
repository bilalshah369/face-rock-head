import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

import LoginWeb from '../screens/Login.web';
import AdminDashboard from '../screens/AdminDashboard.web';
import PackagesList from '../screens/PackagesList.web';
import GenerateQR from '../screens/GenerateQR.web';
import CreatePackageNew from '../screens/package/CreatePackageNew.web';
import PackagesTracking from '../screens/PackagesTracking.web';
import UserManagement from '../screens/UserManagement.web';
import RolesMaster from '../screens/RolesMaster.web';
import StatesMaster from '../screens/StatesMaster.web';
import CitiesMaster from '../screens/CitiesMaster.web';
import CentresMaster from '../screens/CentresMaster.web';
import ScanLogs from '../screens/ScanLogs.web';

const TOKEN_KEY = 'nta_token';

const ProtectedRoute = ({children}: any) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? children : <Navigate to="/login" replace />;
};

export default function AppNavigator() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/login" element={<LoginWeb />} />

      {/* PROTECTED ADMIN */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/packages/create"
        element={
          <ProtectedRoute>
            <CreatePackageNew />
          </ProtectedRoute>
        }
      />

      <Route
        path="/packages/list"
        element={
          <ProtectedRoute>
            <PackagesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/packages/track"
        element={
          <ProtectedRoute>
            <PackagesTracking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scan-logs"
        element={
          <ProtectedRoute>
            <ScanLogs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <RolesMaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/masters/states"
        element={
          <ProtectedRoute>
            <StatesMaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/masters/cities"
        element={
          <ProtectedRoute>
            <CitiesMaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/masters/centres"
        element={
          <ProtectedRoute>
            <CentresMaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/generate-qr"
        element={
          <ProtectedRoute>
            <GenerateQR />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
