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
    <div className="max-w-5xl mx-auto mb-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Scan History</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tracking ID:{' '}
          <span className="font-semibold text-gray-800">{trackingId}</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-10">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />

        <div className="space-y-8">
          {[...scanLogs]
            .sort(
              (a, b) =>
                new Date(b.scan_datetime).getTime() -
                new Date(a.scan_datetime).getTime(),
            )
            .map((log, index) => {
              const isLatest = index === 0;

              return (
                <div key={log.scan_id} className="relative">
                  {/* Timeline dot */}
                  <span
                    className={`absolute left-4 top-6 w-4 h-4 rounded-full border-4 transform -translate-x-1/2 ${
                      isLatest
                        ? 'bg-green-600 border-green-200'
                        : 'bg-blue-600 border-blue-200'
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`ml-8 rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                      isLatest
                        ? 'border-green-300 bg-green-50/30'
                        : 'border-gray-200'
                    }`}>
                    {/* Card Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                            log.qr_type === 'OUTER'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                          {log.qr_type} QR
                        </span>

                        {isLatest && (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            Latest Scan
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-gray-500">
                        {new Date(log.scan_datetime).toLocaleString()}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="my-4 h-px bg-gray-200" />

                    {/* Card Body */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <InfoItem
                        label="Scanned By"
                        value={log.full_name ?? log.scanned_by}
                      />
                      <InfoItem label="Phone" value={log.scanned_phone} />
                      <InfoItem
                        label="Scan Mode"
                        value={
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              log.scan_mode === 'OFFLINE'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                            {log.scan_mode}
                          </span>
                        }
                      />
                      <InfoItem label="Device ID" value={log.device_id} />
                      <InfoItem label="Latitude" value={log.latitude} />
                      <InfoItem label="Longitude" value={log.longitude} />
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
