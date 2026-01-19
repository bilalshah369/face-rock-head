import React, {useEffect, useState} from 'react';
import AdminLayout from '../AdminLayout';
import {API_BASE} from '@env';

const TOKEN_KEY = 'nta_token';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import {ActivityIndicator} from 'react-native';

/* ===== EXPORT ROUTE PREVIEW ===== */
export const exportRoutePreviewExcel = (preview: any) => {
  const centreRows = Object.entries(preview.result).map(
    ([centreId, c]: any, i) => ({
      'S.No': i + 1,
      'Centre ID': centreId,
      'Centre Name': c.centre_name || '',
      Total: c.total,
      'On Route': c.on_route,
      'Off Route': c.off_route,
    }),
  );

  const summarySheet = XLSX.utils.json_to_sheet([
    {
      'Total Scans': preview.total_summary.total_scans,
      'On Route': preview.total_summary.on_route,
      'Off Route': preview.total_summary.off_route,
    },
  ]);

  const centreSheet = XLSX.utils.json_to_sheet(centreRows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(wb, centreSheet, 'Centre Breakdown');

  const buffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `Geographic_Boundary_preview_${Date.now()}.xlsx`,
  );
};

/* ===== EXPORT SCAN HISTORY ===== */
export const exportScanHistoryExcel = (scans: any[]) => {
  const rows = scans.map((s, i) => ({
    'S.No': i + 1,
    'Tracking ID': s.tracking_id,
    'Scan Time': new Date(s.scan_datetime).toLocaleString(),
    'Scanned By': s.full_name || s.scanned_by || '',
    Status: s.status || 'SCANNED',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Scan History');

  const buffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `scan_history_${Date.now()}.xlsx`,
  );
};

type CentreSummary = {
  centre_name: string;
  total: number;
  on_route: number;
  off_route: number;
};

type RoutePreviewResponse = {
  total_summary: {
    total_scans: number;
    on_route: number;
    off_route: number;
  };
  result: Record<string, CentreSummary>;
};

type ScanItem = {
  scan_id: string;
  tracking_id: string;
  scan_datetime: string;
  scanned_by?: string;
  full_name?: string;
  status?: string;
};

export default function ScanRoutePreviewWithHistory() {
  const token = localStorage.getItem(TOKEN_KEY);

  /* ---------------- Route Preview State ---------------- */
  const [distance, setDistance] = useState(1000);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<RoutePreviewResponse | null>(
    null,
  );

  /* ---------------- Scan History State ---------------- */
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  /* ---------------- Fetch Route Preview ---------------- */
  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch(`${API_BASE}/scans/previewRouteCheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({distance_meters: distance}),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPreviewData(json);
    } catch (err) {
      console.error(err);
      alert('Failed to load route preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ---------------- Fetch Scan History ---------------- */
  const fetchScans = async () => {
    const res = await fetch(`${API_BASE}/scans/getAllScans`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setScans(json.data);
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 space-y-4 bg-gray-50 min-h-screen text-sm">
        {/* ===== ROUTE PREVIEW CONTROLS ===== */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end justify-between">
            {/* LEFT */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Geographic Boundary (meter)
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={e => setDistance(Number(e.target.value))}
                  className="border rounded-md px-3 py-2 w-40 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => {
                  setShowPreview(true);
                  fetchPreview();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-xs hover:bg-green-700">
                Preview Packages
              </button>
            </div>

            {/* RIGHT */}
            <div className="flex gap-2">
              <button
                type="button"
                //onClick={() => exportScansToExcel(scans)}
                onClick={() => exportRoutePreviewExcel(previewData)}
                // disabled={!scans.length}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs transition
    ${
      false
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
    }`}>
                <IconDownload />
                Export Excel
              </button>
            </div>
          </div>
        </div>
        {previewLoading ? <ActivityIndicator size={'small'} /> : undefined}
        {/* ===== SUMMARY BOXES ===== */}
        {true && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TOTAL */}
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-500">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900">
                {previewData?.total_summary.total_scans ?? 0}
              </p>
            </div>

            {/* ON ROUTE */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-600">On Route</p>
              <p className="text-2xl font-bold text-green-700">
                {previewData?.total_summary.on_route ?? 0}
              </p>
            </div>

            {/* OFF ROUTE */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs text-red-600">Off Route</p>
              <p className="text-2xl font-bold text-red-700">
                {previewData?.total_summary.off_route ?? 0}
              </p>
            </div>
          </div>
        )}

        {/* ===== CENTRE SUMMARY TABLE ===== */}
        {true && (
          <div className="bg-white border rounded overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Centre ID</th>
                  <th className="px-3 py-2 text-left">Centre Name</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">On Route</th>
                  <th className="px-3 py-2">Off Route</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(previewData?.result || []).map(
                  ([centreId, c]) => (
                    <tr
                      key={centreId}
                      className="border-t hover:bg-gray-50 transition">
                      <td className="px-3 py-2">{centreId}</td>
                      <td className="px-3 py-2">{c.centre_name || '-'}</td>
                      <td className="px-3 py-2 text-center">{c.total}</td>
                      <td className="px-3 py-2 text-center text-green-700">
                        {c.on_route}
                      </td>
                      <td className="px-3 py-2 text-center text-red-700">
                        {c.off_route}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v12" stroke="currentColor" strokeWidth="2" />
    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
    <rect
      x="4"
      y="18"
      width="16"
      height="3"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
