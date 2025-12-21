import React from 'react';

interface ScanLog {
  scan_id: string;
  qr_type: 'OUTER' | 'INNER';
  scanned_by: string;
  scanned_phone: string;
  scan_datetime: string;
  scan_mode: 'ONLINE' | 'OFFLINE';
  device_id: string;
  latitude: string;
  longitude: string;
}

const SAMPLE_SCAN_LOGS: ScanLog[] = [
  {
    scan_id: '3',
    qr_type: 'OUTER',
    scanned_by: 'Dispatch Officer',
    scanned_phone: '9000000003',
    scan_datetime: '2025-12-18T05:10:52Z',
    scan_mode: 'OFFLINE',
    device_id: 'ANDROID-01',
    latitude: '28.613900',
    longitude: '77.209000',
  },
  {
    scan_id: '2',
    qr_type: 'OUTER',
    scanned_by: 'Warehouse Incharge',
    scanned_phone: '9000000002',
    scan_datetime: '2025-12-18T01:45:10Z',
    scan_mode: 'ONLINE',
    device_id: 'ANDROID-02',
    latitude: '28.620120',
    longitude: '77.215332',
  },
  {
    scan_id: '1',
    qr_type: 'OUTER',
    scanned_by: 'Security Gate',
    scanned_phone: '9000000001',
    scan_datetime: '2025-12-17T23:40:52Z',
    scan_mode: 'ONLINE',
    device_id: 'ANDROID-SEC',
    latitude: '28.612001',
    longitude: '77.208221',
  },
];

export default function ScanLogsTimelineDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Scan History</h2>
        <p className="text-sm text-gray-600">
          Tracking ID: <span className="font-medium">OUT-1001</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="relative border-l border-gray-300 pl-6 space-y-6">
        {SAMPLE_SCAN_LOGS.map((log, index) => (
          <div key={log.scan_id} className="relative">
            {/* Dot */}
            <span
              className={`absolute -left-[7px] top-4 w-3 h-3 rounded-full ${
                index === 0 ? 'bg-green-600' : 'bg-blue-600'
              }`}></span>

            {/* Card */}
            <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition">
              {/* Top Row */}
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
                  <span className="text-gray-700 font-medium">Scanned By</span>
                  <div>{log.scanned_by}</div>
                </div>

                <div>
                  <span className="text-gray-700 font-medium">Phone</span>
                  <div>{log.scanned_phone}</div>
                </div>

                <div>
                  <span className="text-gray-700 font-medium">Mode</span>
                  <div
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      log.scan_mode === 'OFFLINE'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                    {log.scan_mode}
                  </div>
                </div>

                <div>
                  <span className="text-gray-700 font-medium">Device</span>
                  <div>{log.device_id}</div>
                </div>

                <div>
                  <span className="text-gray-700 font-medium">Latitude</span>
                  <div>{log.latitude}</div>
                </div>

                <div>
                  <span className="text-gray-700 font-medium">Longitude</span>
                  <div>{log.longitude}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
