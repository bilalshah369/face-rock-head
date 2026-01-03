import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';

import {API_BASE} from '@env';
import {useNavigate} from 'react-router-dom';
const TOKEN_KEY = 'nta_token';

type PackageItem = {
  id: number;
  tracking_id: string;
  status: string;
  qr_type?: string;
  created_on: string;
  outer_package_id?: string;
  destination_centre_id?: string;
  encrypted_qr_payload?: string;
  dispatch_datetime?: string;
  return_dispatch_datetime?: string;
  created_by?: string;
  updated_on?: string;
  updated_by?: string;
  centre_code?: string;
  centre_name?: string;
};
const statusStyles: Record<string, string> = {
  CREATED: 'bg-blue-50 text-blue-700',
  PENDING: 'bg-yellow-50 text-yellow-700',
  DISPATCHED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700',
  RETURNED: 'bg-gray-100 text-gray-700',
  INACTIVE: 'bg-red-50 text-red-700',
};
export default function PackagesTracking({navigation}: any) {
  const navigate = useNavigate();
  const [centre, setCentre] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const token = localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE}/packages?page=1&limit=20`;

      if (centre) url += `&centre=${encodeURIComponent(centre)}`;
      if (fromDate) url += `&from_date=${fromDate}`;
      if (toDate) url += `&to_date=${toDate}`;
      if (trackingId) {
        url += `&tracking_id=${encodeURIComponent(trackingId)}`;
      }

      if (status) {
        url += `&status=${status}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error('Failed to fetch packages');
      }

      setPackages(json.data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen p-4 text-sm space-y-4">
        <div className="bg-white p-3 rounded border flex flex-wrap gap-3 items-end justify-between">
          {/* LEFT FILTERS */}
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tracking ID
              </label>
              <input
                className="border rounded px-2 py-1.5 w-40 text-xs"
                placeholder="OUT-7001"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Centre
              </label>
              <input
                className="border rounded px-2 py-1.5 w-40 text-xs"
                placeholder="Delhi"
                value={centre}
                onChange={e => setCentre(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                className="border rounded px-2 py-1.5 w-36 text-xs"
                value={status}
                onChange={e => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="CREATED">Created</option>
                <option value="PENDING">Pending</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="DELIVERED">Delivered</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <input
                type="date"
                className="border rounded px-2 py-1.5 text-xs"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <input
                type="date"
                className="border rounded px-2 py-1.5 text-xs"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>

            <button
              onClick={fetchPackages}
              className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs hover:bg-gray-900">
              Search
            </button>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs rounded border ${
                viewMode === 'table'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}>
              Table
            </button>

            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 text-xs rounded border ${
                viewMode === 'card'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}>
              Card
            </button>
          </div>
        </div>
        {/* Toggle View */}{' '}
        {/* <div className="flex justify-end mb-4">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50 text-sm font-medium">
            {viewMode === 'table' ? 'Card View' : 'Table View'}{' '}
          </button>
        </div> */}
        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded border overflow-x-auto">
            {loading ? (
              <p className="p-6">Loading packages...</p>
            ) : error ? (
              <p className="p-6 text-red-600">{error}</p>
            ) : packages.length === 0 ? (
              <p className="p-6">No packages found.</p>
            ) : (
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-100 text-gray-600 text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left">Tracking ID</th>
                    <th className="px-3 py-2 text-left">Destination</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Created</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-2 border font-medium">
                        {pkg.tracking_id}
                      </td>

                      <td className="px-3 py-2 border text-gray-600">
                        {pkg.centre_code}/{pkg.centre_name}
                      </td>

                      <td className="px-3 py-2 border">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            statusStyles[pkg.status] ||
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {pkg.status}
                        </span>
                      </td>

                      <td className="px-3 py-2 border text-gray-500 text-xs">
                        {new Date(pkg.created_on).toLocaleString()}
                      </td>

                      <td className="px-3 py-2 border">
                        <div className="flex gap-2 flex-wrap">
                          <ActionButton
                            variant="print"
                            icon={<IconPrint />}
                            label="Print"
                            disabled={!!pkg.qr_type}
                            onClick={() => window.print()}
                          />
                          <ActionButton
                            variant="scan"
                            icon={<IconScan />}
                            label="Scans"
                            onClick={() => {
                              localStorage.setItem(
                                'tracking_id',
                                pkg.tracking_id,
                              );
                              navigate(`/packages/scan-logs`);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {/* CARD VIEW */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className="bg-white rounded-md border p-3 hover:shadow-sm transition">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Tracking ID</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {pkg.tracking_id}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      statusStyles[pkg.status] || 'bg-gray-100 text-gray-700'
                    }`}>
                    {pkg.status}
                  </span>
                </div>

                {/* DETAILS — THIS IS WHERE YOUR LINES GO */}
                <div className="mb-2">
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p>
                      <span className="font-medium">Centre:</span>{' '}
                      {pkg.centre_code}/{pkg.centre_name}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(pkg.created_on).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-1.5 flex-wrap">
                  <ActionButton
                    variant="print"
                    icon={<IconPrint />}
                    label="Print"
                    disabled={!!pkg.qr_type}
                    onClick={() => window.print()}
                  />

                  <ActionButton
                    onClick={() => {
                      localStorage.setItem('tracking_id', pkg.tracking_id);
                      navigate(`/packages/scan-logs`);
                    }}
                    variant="scan"
                    icon={<IconScan />}
                    label="Scans"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  variant = 'default',
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'edit' | 'qr' | 'print' | 'inactive' | 'scan' | 'default';
}) {
  const styles: Record<string, string> = {
    edit: 'text-blue-700 border-blue-200 hover:bg-blue-50',
    qr: 'text-indigo-700 border-indigo-200 hover:bg-indigo-50',
    print: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    inactive: 'text-red-700 border-red-200 hover:bg-red-50',
    scan: 'text-purple-700 border-purple-200 hover:bg-purple-50',
    default: 'text-gray-700 border-gray-200 hover:bg-gray-50',
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition
        ${
          disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : `bg-white ${styles[variant]}`
        }`}>
      {icon}
      {label}
    </button>
  );
}

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 20h9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconQR = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="7"
      height="7"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M14 14h3v3h-3z" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconPrint = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="2" />
    <rect
      x="6"
      y="13"
      width="12"
      height="8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M6 17h12" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconInactive = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M5 19L19 5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IconScan = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 7V5a2 2 0 0 1 2-2h2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 7V5a2 2 0 0 0-2-2h-2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3 17v2a2 2 0 0 0 2 2h2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 17v2a2 2 0 0 1-2 2h-2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 12h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
