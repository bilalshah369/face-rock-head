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

interface ZigZagScanViewProps {
  trackingId: string;
}

export default function ZigZagScanView({trackingId}: ZigZagScanViewProps) {
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
    <div className="bg-white border rounded-md p-6">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Scan Journey</h3>
          <p className="text-xs text-gray-500">
            Tracking ID: <span className="font-medium">{trackingId}</span>
          </p>
        </div>

        <span className="text-xs text-gray-600">
          Total Scans: <span className="font-semibold">{scanLogs.length}</span>
        </span>
      </div>

      {/* ZIG ZAG CONTAINER */}
      <div className="relative">
        {/* CENTER LINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />

        <div className="space-y-10">
          {[...scanLogs]
            .sort(
              (a, b) =>
                new Date(b.scan_datetime).getTime() -
                new Date(a.scan_datetime).getTime(),
            )
            .map((log, index) => {
              const isLeft = index % 2 === 0;
              const isLatest = index === 0;

              return (
                <div
                  key={log.scan_id}
                  className={`relative flex ${
                    isLeft ? 'justify-start pr-12' : 'justify-end pl-12'
                  }`}>
                  {/* CONNECTOR DOT */}
                  <div
                    className={`absolute left-1/2 top-6 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 ${
                      log.scan_mode === 'OFFLINE'
                        ? 'bg-yellow-500 border-yellow-200'
                        : 'bg-green-600 border-green-200'
                    }`}
                  />

                  {/* CARD */}
                  <div
                    className={`w-full md:w-[45%] border rounded-md p-4 text-sm ${
                      isLatest
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200'
                    }`}>
                    {/* TOP ROW */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2 items-center">
                        <span className="text-xs font-semibold text-gray-500">
                          Step {scanLogs.length - index}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            log.qr_type === 'OUTER'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                          {log.qr_type}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            log.scan_mode === 'OFFLINE'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                          {log.scan_mode}
                        </span>
                      </div>

                      {isLatest && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-white font-semibold">
                          CURRENT
                        </span>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-gray-500">Scanned By</div>
                        <div className="font-medium">
                          {log.full_name ?? log.scanned_by}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500">Device</div>
                        <div>{log.device_id}</div>
                      </div>

                      <div>
                        <div className="text-gray-500">Latitude</div>
                        <div>{log.latitude}</div>
                      </div>

                      <div>
                        <div className="text-gray-500">Longitude</div>
                        <div>{log.longitude}</div>
                      </div>
                    </div>

                    {/* TIME */}
                    <div className="mt-3 text-xs text-gray-500">
                      {new Date(log.scan_datetime).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
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
