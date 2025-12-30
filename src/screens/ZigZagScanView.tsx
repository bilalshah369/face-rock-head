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
  scan_status: string;
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
                    className={`absolute left-1/2 top-5 transform -translate-x-1/2 w-3 h-3 rounded-full border-2
    ${
      log.scan_status === 'ON_ROUTE'
        ? 'bg-green-600 border-green-200'
        : 'bg-red-600 border-red-200 animate-shake'
    }
  `}
                  />

                  {/* CARD */}
                  {/* CARD */}
                  <div
                    className={`w-full md:w-[42%] rounded-lg border px-4 py-3 text-xs shadow-sm transition-all
    ${
      log.scan_status === 'ON_ROUTE'
        ? 'bg-green-50 border-green-300'
        : 'bg-red-50 border-red-300 animate-shake'
    }
    ${isLatest ? 'ring-2 ring-offset-1 ring-green-400' : ''}
  `}>
                    {/* HEADER ROW */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600">
                          #{scanLogs.length - index}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold
          ${
            log.qr_type === 'OUTER'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          }
        `}>
                          {log.qr_type}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold
          ${
            log.scan_status === 'ON_ROUTE'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }
        `}>
                          {log.scan_status}
                        </span>
                      </div>

                      {isLatest && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black text-white font-semibold">
                          CURRENT
                        </span>
                      )}
                    </div>

                    {/* META GRID */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div>
                        <span className="text-gray-500">By</span>
                        <div className="font-medium">
                          {log.full_name ?? log.scanned_by}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500">Device</span>
                        <div>{log.device_id}</div>
                      </div>

                      <div>
                        <span className="text-gray-500">Lat</span>
                        <div>{log.latitude}</div>
                      </div>

                      <div>
                        <span className="text-gray-500">Lng</span>
                        <div>{log.longitude}</div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-2 flex justify-between text-[10px] text-gray-600">
                      <span>
                        {new Date(log.scan_datetime).toLocaleString()}
                      </span>

                      <span
                        className={`font-semibold ${
                          log.scan_mode === 'OFFLINE'
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}>
                        {log.scan_mode}
                      </span>
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
