import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';
import ScanLogsTimelineDemo from './ScanLogsTimelineDemo';
import ScanLogsTimeline from './ScanLogsTimeline.web';

import {API_BASE} from '@env';
import ZigZagScanView from './ZigZagScanView';
import JourneyScanView from './JourneyScanView.web';
import PackageQRTracking from '../Map/PackageQRTracking';
const TOKEN_KEY = 'nta_token';

interface PackageItem {
  outer_package_id: string;
  tracking_id: string;
  centre_name: string;
  status: string;
  created_on: string;
}

interface ScanLog {
  scan_id: string;
  tracking_id: string;
  qr_type: string;
  scanned_by: string;
  scanned_phone: string;
  scan_datetime: string;
  latitude: string;
  longitude: string;
  scan_mode: string;
  device_id: string;
}

export default function ScanLogs({navigation}: any) {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedTrackingId, setSelectedTrackingId] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(false);
  type ViewDesign = 'horizontal' | 'journey' | 'zigzag';

  const [design, setDesign] = useState<ViewDesign>('zigzag');
  const token = localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    const storedTrackingId = localStorage.getItem('tracking_id');

    if (storedTrackingId) {
      setSelectedTrackingId(storedTrackingId);
      setTrackingInput('');
    }
  }, []);
  const handleSearch = () => {
    if (!trackingInput.trim()) return;
    setSelectedTrackingId(trackingInput.trim());
  };

  /* Fetch packages */
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_BASE}/packages`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const json = await res.json();
        setPackages(json.data || []);
      } catch (err) {
        console.error('Failed to load packages', err);
      }
    };
    fetchPackages();
  }, []);

  /* Fetch scan logs */
  useEffect(() => {
    if (!selectedTrackingId) return;

    const fetchScanLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/scans/${selectedTrackingId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const json = await res.json();
        setScanLogs(json.data || []);
      } catch (err) {
        console.error('Failed to load scan logs', err);
        setScanLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScanLogs();
  }, [selectedTrackingId]);

  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen p-4 text-sm space-y-4">
        {/* ================= FILTERS ================= */}
        <div className="bg-white p-3 rounded border flex flex-wrap gap-3 items-end justify-between">
          {/* LEFT FILTERS */}
          <div className="flex flex-wrap gap-3 items-end">
            {/* Package Select */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Select Package
              </label>
              <select
                className="border rounded px-2 py-1.5 w-64 text-xs"
                value={selectedTrackingId}
                onChange={e => {
                  setSelectedTrackingId(e.target.value);
                  setTrackingInput('');
                }}>
                <option value="">-- Select Package --</option>
                {packages.map(pkg => (
                  <option key={pkg.outer_package_id} value={pkg.tracking_id}>
                    {pkg.tracking_id} — {pkg.centre_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Search */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tracking ID
              </label>
              <input
                type="text"
                placeholder="OUT-1001"
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                className="border rounded px-2 py-1.5 w-40 text-xs"
              />
            </div>

            <button
              onClick={handleSearch}
              className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs hover:bg-gray-900">
              Search
            </button>
          </div>
          {selectedTrackingId && (
            <div className="text-xs text-gray-600">
              Total Scans:{' '}
              <span className="font-semibold text-gray-800">
                {scanLogs.length}
              </span>
            </div>
          )}
          {/* RIGHT INFO */}
          <div className="inline-flex rounded border bg-white text-xs">
            <button
              onClick={() => setDesign('horizontal')}
              className={`px-3 py-1.5 border-r ${
                design === 'horizontal'
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-50'
              }`}>
              Horizontal
            </button>

            <button
              onClick={() => setDesign('journey')}
              className={`px-3 py-1.5 border-r ${
                design === 'journey'
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-50'
              }`}>
              Journey
            </button>

            <button
              onClick={() => setDesign('zigzag')}
              className={`px-3 py-1.5 ${
                design === 'zigzag'
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-50'
              }`}>
              Zig-Zag
            </button>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        {selectedTrackingId && (
          <div className="bg-white border rounded px-3 py-2 text-sm">
            <span className="font-medium">Tracking ID:</span>{' '}
            {selectedTrackingId}
          </div>
        )}

        {loading && <p>Loading scan logs...</p>}

        {!loading && selectedTrackingId && scanLogs.length === 0 && (
          <p className="text-gray-500">No scan logs found.</p>
        )}
        {/* {selectedTrackingId && (
          <div className="bg-white border rounded p-3">
            <ScanLogsTimeline trackingId={selectedTrackingId} />
          </div>
        )} */}
        {design === 'horizontal' && (
          <ScanLogsTimeline trackingId={selectedTrackingId} />
        )}

        {design === 'journey' && (
          <JourneyScanView trackingId={selectedTrackingId} />
        )}

        {design === 'zigzag' && (
          <ZigZagScanView trackingId={selectedTrackingId} />
        )}
        <PackageQRTracking trackingId={selectedTrackingId} />
        {/* ================= TABLE ================= */}
        {!loading && scanLogs.length > 0 && (
          <div className="bg-white border rounded overflow-x-auto">
            <div className="px-3 py-2 border-b text-sm font-medium text-gray-700">
              Scan Logs (Detailed)
            </div>

            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-2 py-1 text-left">Scan ID</th>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">Scanned By</th>
                  <th className="px-2 py-1">Phone</th>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Mode</th>
                  <th className="px-2 py-1">Device</th>
                  <th className="px-2 py-1">Lat</th>
                  <th className="px-2 py-1">Lng</th>
                </tr>
              </thead>
              <tbody>
                {scanLogs.map(log => (
                  <tr key={log.scan_id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-1">{log.scan_id}</td>
                    <td className="px-2 py-1">{log.qr_type}</td>
                    <td className="px-2 py-1">{log.scanned_by}</td>
                    <td className="px-2 py-1">{log.scanned_phone}</td>
                    <td className="px-2 py-1 text-gray-500">
                      {new Date(log.scan_datetime).toLocaleString()}
                    </td>
                    <td className="px-2 py-1">{log.scan_mode}</td>
                    <td className="px-2 py-1">{log.device_id}</td>
                    <td className="px-2 py-1">{log.latitude}</td>
                    <td className="px-2 py-1">{log.longitude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
