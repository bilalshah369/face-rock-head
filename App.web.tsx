import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigatorWeb';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import LoginWeb from './src/screens/Login.web';
import AdminDashboard from './src/screens/AdminDashboard.web';
import PackagesList from './src/screens/PackagesList.web';
import PackagesTracking from './src/screens/PackagesTracking.web';
import ScanLogs from './src/screens/ScanLogs.web';
import UserManagement from './src/screens/UserManagement.web';
import RolesMaster from './src/screens/RolesMaster.web';
import StatesMaster from './src/screens/StatesMaster.web';
import CreatePackageNew from './src/screens/package/CreatePackageNew.web';
import CitiesMaster from './src/screens/CitiesMaster.web';
import CentresMaster from './src/screens/CentresMaster.web';
import GenerateQR from './src/screens/GenerateQR.web';
import OuterPackageExcelImport from './src/screens/workspace/OuterPackageExcelImport';
import GenerateQR_center from './src/screens/package/GenerateQR_center.web';
import PrintQRPDF_center from './src/screens/package/PrintQRPDF_center.web';
const TOKEN_KEY = 'nta_token';
const ProtectedRoute = ({children}: any) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? children : <Navigate to="/login" replace />;
};
export default function App() {
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
        path="/packages/qr-list"
        element={
          <ProtectedRoute>
            <GenerateQR_center />
          </ProtectedRoute>
        }
      />
      <Route
        path="/packages/print-qr-pdf"
        element={
          <ProtectedRoute>
            <PrintQRPDF_center />
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
        path="/packages/scan-logs"
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
        path="/packages/generate-qr"
        element={
          <ProtectedRoute>
            <GenerateQR />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ImportPackages"
        element={
          <ProtectedRoute>
            <OuterPackageExcelImport />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// import React, {useState} from 'react';
// import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

// const App = () => {
//   const [count, setCount] = useState(0);
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Hello from {'\n'}React Native Web!</Text>
//       <TouchableOpacity
//         onPress={() => setCount(count + 1)}
//         style={styles.button}>
//         <Text>Click me!</Text>
//       </TouchableOpacity>

//       <Text>You clicked {count} times!</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#C3E8BD',
//     paddingTop: 40,
//     paddingHorizontal: 10,
//   },
//   button: {
//     backgroundColor: '#ADBDFF',
//     padding: 5,
//     marginVertical: 20,
//     alignSelf: 'flex-start',
//   },
//   title: {
//     fontSize: 40,
//   },
// });

// export default App;
