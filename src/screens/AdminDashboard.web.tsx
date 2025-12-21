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
import {API_BASE} from '@env';
const TOKEN_KEY = 'nta_token';

export default function Dashboard() {
  const token = localStorage.getItem(TOKEN_KEY);

  const [summary, setSummary] = useState<any>(null);
  const [centres, setCentres] = useState<any[]>([]);
  const [scanActivity, setScanActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = {Authorization: `Bearer ${token}`};

    Promise.all([
      fetch(`${API_BASE}/reports/summary`, {headers}).then(r => r.json()),
      fetch(`${API_BASE}/reports/centre-wise`, {headers}).then(r => r.json()),
      fetch(`${API_BASE}/reports/scan-activity`, {headers}).then(r => r.json()),
    ])
      .then(([s, c, a]) => {
        setSummary(s.data);
        setCentres(c.data);
        setScanActivity(a.data);
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
