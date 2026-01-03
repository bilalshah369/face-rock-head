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

interface JourneyScanViewProps {
  trackingId: string;
}

export default function JourneyScanView({trackingId}: JourneyScanViewProps) {
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
    <div className="bg-white border rounded-md overflow-hidden">
      {/* HEADER */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Scan History</h3>
          <p className="text-xs text-gray-500">
            Tracking ID: <span className="font-medium">{trackingId}</span>
          </p>
        </div>

        <span className="text-xs text-gray-600">
          Total scans: <span className="font-semibold">{scanLogs.length}</span>
        </span>
      </div>

      {/* LIST */}
      <div className="divide-y">
        {[...scanLogs]
          .sort(
            (a, b) =>
              new Date(b.scan_datetime).getTime() -
              new Date(a.scan_datetime).getTime(),
          )
          .map((log, index) => {
            const isLatest = index === 0;

            return (
              <div
                key={log.scan_id}
                className={`flex gap-4 px-4 py-3 text-sm ${
                  isLatest ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}>
                {/* STATUS RAIL */}
                <div
                  className={`w-1 rounded-full ${
                    log.scan_mode === 'OFFLINE'
                      ? 'bg-yellow-400'
                      : 'bg-green-500'
                  }`}
                />

                {/* MAIN CONTENT */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">QR</div>
                    <div className="font-medium">{log.qr_type}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Scanned By</div>
                    <div>{log.full_name ?? log.scanned_by}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Mode</div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        log.scan_mode === 'OFFLINE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                      {log.scan_mode}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Device</div>
                    <div>{log.device_id}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-xs">
                      {log.latitude}, {log.longitude}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">Time</div>
                    <div className="text-xs">
                      {new Date(log.scan_datetime).toLocaleString()}
                    </div>

                    {isLatest && (
                      <div className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-white">
                        Latest
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
function InfoItem({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 text-gray-800">{value}</div>
    </div>
  );
}
