import React, {useEffect, useState} from 'react';

import {API_BASE} from '@env';
const TOKEN_KEY = 'nta_token';

export interface ScanLog {
  scan_id: string;
  qr_type: 'OUTER' | 'INNER';
  scanned_by: string;
  full_name: string;
  scanned_phone: string;
  scan_datetime: string;
  scan_mode: 'ONLINE' | 'OFFLINE';
  device_id: string;
  latitude: string;
  longitude: string;
}

interface ScanLogsTimelineProps {
  trackingId: string;
}

export default function ScanLogsTimeline({trackingId}: ScanLogsTimelineProps) {
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);

  /* ================= FETCH SCAN LOGS ================= */
  useEffect(() => {
    if (!trackingId) return;

    const fetchScanLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/scans/${trackingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, [trackingId]);

  /* ================= STATES ================= */
  if (!trackingId) return null;

  if (loading) {
    return <p className="text-gray-500">Loading scan history...</p>;
  }

  if (!loading && scanLogs.length === 0) {
    return <p className="text-gray-500">No scan history available.</p>;
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl mx-auto mb-10">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Scan History</h2>
        <p className="text-sm text-gray-600">
          Tracking ID: <span className="font-medium">{trackingId}</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300" />

        <div className="space-y-6">
          {[...scanLogs]
            .sort(
              (a, b) =>
                new Date(b.scan_datetime).getTime() -
                new Date(a.scan_datetime).getTime(),
            )
            .map((log, index) => (
              <div key={log.scan_id} className="relative">
                {/* Dot perfectly centered on line */}
                <span
                  className={`absolute left-3 top-4 w-3 h-3 rounded-full transform -translate-x-1/2 ${
                    index === 0 ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                />

                {/* Card */}
                <div className="bg-white rounded-lg shadow-sm border p-4 ml-6 hover:shadow-md transition">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          log.qr_type === 'OUTER'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                        {log.qr_type}
                      </span>
                      <span className="font-medium text-gray-800">
                        Package Scanned
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">
                      {new Date(log.scan_datetime).toLocaleString()}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-700">
                        Scanned By
                      </span>
                      <div>{log.full_name ?? log.scanned_by}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone</span>
                      <div>{log.scanned_phone}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Mode</span>
                      <span
                        className={`ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          log.scan_mode === 'OFFLINE'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                        {log.scan_mode}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Device</span>
                      <div>{log.device_id}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Latitude
                      </span>
                      <div>{log.latitude}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Longitude
                      </span>
                      <div>{log.longitude}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
