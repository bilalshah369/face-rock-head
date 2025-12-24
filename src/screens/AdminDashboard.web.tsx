import React, {useEffect, useState} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import AdminLayout from './AdminLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
import {API_BASE, REACT_APP_GOOGLE_MAPS_KEY} from '@env';

import PackageRouteMap from '../Map/PackageRouteMap';
import PackageJourneyMap from '../Map/PackageJourneyMap';
import PackageQRTracking from '../Map/PackageQRTracking';
import {useNavigate} from 'react-router-dom';
const TOKEN_KEY = 'nta_token';

export default function Dashboard() {
  const token = localStorage.getItem(TOKEN_KEY);
  const nevigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [centres, setCentres] = useState<any[]>([]);
  const [scanActivity, setScanActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const headers = {Authorization: `Bearer ${token}`};

  //   Promise.all([
  //     fetch(`${API_BASE}/reports/summary`, {headers}).then(r => r.json()),
  //     fetch(`${API_BASE}/reports/centre-wise`, {headers}).then(r => r.json()),
  //     fetch(`${API_BASE}/reports/scan-activity`, {headers}).then(r => r.json()),
  //   ])
  //     .then(([s, c, a]) => {
  //       setSummary(s.data);
  //       setCentres(c.data);
  //       setScanActivity(a.data);
  //     })
  //     .finally(() => setLoading(false));
  // }, []);
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    }
  }, []);
  useEffect(() => {
    const headers = {Authorization: `Bearer ${token}`};

    const handleResponse = async (res: Response) => {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        //window.location.href = '/login';
        localStorage.clear();
        nevigate('/login');
        throw new Error('Unauthorized');
      }
      return res.json();
    };

    Promise.all([
      fetch(`${API_BASE}/reports/summary`, {headers}).then(handleResponse),
      fetch(`${API_BASE}/reports/centre-wise`, {headers}).then(handleResponse),
      fetch(`${API_BASE}/reports/scan-activity`, {headers}).then(
        handleResponse,
      ),
    ])
      .then(([s, c, a]) => {
        setSummary(s.data);
        setCentres(c.data);
        setScanActivity(a.data);
      })
      .catch(err => {
        console.error('Dashboard API error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  }

  const chartData = {
    labels: scanActivity.map(i => new Date(i.scan_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Online Scans',
        data: scanActivity.map(i => Number(i.online_scans)),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Offline Scans',
        data: scanActivity.map(i => Number(i.offline_scans)),
        backgroundColor: '#9ca3af',
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* ===== SUMMARY CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Stat title="Total Packages" value={summary.total_packages} />
          <Stat title="Pending" value={summary.pending} />
          <Stat title="Dispatched" value={summary.dispatched} />
          <Stat title="Delivered" value={summary.delivered} />
          <Stat title="Returned" value={summary.returned} />
        </div>
        {/* Google Map */}
        <div className="bg-white border rounded-md p-4">
          <h3 className="font-medium mb-3 text-gray-700">Scan Locations</h3>
          <div className="w-full border">
            {/* Placeholder for Google Map */}
            {/* <iframe
              title="Scan Locations Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2525.047904694378!2d-0.127758!3d51.50735099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604c6a8b6e8c7%3A0x5a8b6e8c7a8b6e8c7!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!"
              width="100%"
              height="450"
              frameBorder="0"
              style={{border: 0}}
              allowFullScreen
              loading="lazy"></iframe> */}
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Package Route</h2>
              <PackageQRTracking />
              {/* <PackageJourneyMap
                googleMapsApiKey={REACT_APP_GOOGLE_MAPS_KEY}
                scanLocations={[
                  {latitude: 28.6139, longitude: 77.209}, // Delhi
                  {latitude: 26.9124, longitude: 75.7873}, // Jaipur
                  {latitude: 23.0225, longitude: 72.5714}, // Ahmedabad
                ]}
                destinationLocation={{
                  latitude: 19.076,
                  longitude: 72.8777, // Mumbai
                }}
              /> */}
              {/* <PackageRouteMap
                googleMapsApiKey={REACT_APP_GOOGLE_MAPS_KEY}
                scanLocation={{
                  latitude: 28.6139, // Scan location (Delhi)
                  longitude: 77.209,
                }}
                destinationLocation={{
                  latitude: 19.076, // Destination (Mumbai)
                  longitude: 72.8777,
                }}
              /> */}
            </div>
          </div>
        </div>
        {/* ===== MAIN CONTENT (TABLE + CHART) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ===== CENTRE TABLE ===== */}
          <div className="bg-white border rounded-md">
            <div className="px-4 py-3 border-b font-medium text-gray-700">
              Centre-wise Packages
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Centre</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Delivered</th>
                    <th className="px-4 py-2">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {centres.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{c.centre_name}</td>
                      <td className="px-4 py-2 text-center">
                        {c.total_packages}
                      </td>
                      <td className="px-4 py-2 text-center text-green-600">
                        {c.delivered}
                      </td>
                      <td className="px-4 py-2 text-center text-yellow-600">
                        {c.pending}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== SCAN ACTIVITY ===== */}
          <div className="bg-white border rounded-md p-4">
            <h3 className="font-medium mb-3 text-gray-700">
              Scan Activity (Online vs Offline)
            </h3>
            <Bar data={chartData} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ===== CARD ===== */
function Stat({title, value}: {title: string; value: string}) {
  return (
    <div className="bg-white border rounded-md p-4 text-center">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  );
}
