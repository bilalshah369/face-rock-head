import React, {useEffect, useState} from 'react';
import AdminLayout from '../AdminLayout';
import {API_BASE} from '@env';
import {ActivityIndicator} from 'react-native';
import {useNavigate} from 'react-router-dom';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
const TOKEN_KEY = 'nta_token';

type ScanItem = {
  scan_id: string;
  tracking_id: string;
  scan_datetime: string;
  scanned_by?: string;
  full_name?: string;
  scan_type?: string;
  status?: string;
};
type RouteSummary = {
  total_scans: number;
  on_route: number;
  off_route: number;
};

const statusStyles: Record<string, string> = {
  SCANNED: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
  PENDING: 'bg-yellow-50 text-yellow-700',
};

export default function ScanHistoryTable() {
  const token = localStorage.getItem(TOKEN_KEY);

  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [trackingId, setTrackingId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  /* ---------------- Route Summary ---------------- */
  const [distance, setDistance] = useState('10000');
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  const exportScansToExcel = (rows: any[]) => {
    const formatted = rows.map((s, i) => ({
      'S.No': i + 1,
      'Tracking ID': s.tracking_id,
      'Scan Time': new Date(s.scan_datetime).toLocaleString(),
      'Scanned By': s.full_name || s.scanned_by || '',
      Status: s.status || 'SCANNED',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scan History');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const file = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(file, `scan_history_${Date.now()}.xlsx`);
  };

  const fetchRouteSummary = async () => {
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams();

      if (trackingId) params.append('tracking_id', trackingId);
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);

      const url = `${API_BASE}/scans/previewRouteCheck?${params.toString()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({distance_meters: Number(distance)}),
      });

      const json = await res.json();
      if (json.success) setSummary(json.total_summary);
    } catch (e) {
      console.error(e);
    } finally {
      setSummaryLoading(false);
    }
  };
  const exportAllScans = async () => {
    let url = `${API_BASE}/scans/getAllScans?page=${1}&limit=${100000}`;

    if (trackingId) url += `&tracking_id=${trackingId}`;
    if (fromDate) url += `&from_date=${fromDate}`;
    if (toDate) url += `&to_date=${toDate}`;

    const res = await fetch(url, {
      headers: {Authorization: `Bearer ${token}`},
    });

    const json = await res.json();
    if (json.success) {
      exportScansToExcel(json.data);
    }
  };
  const fetchScans = async (pageNo = page, pageSize = limit) => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE}/scans/getAllScans?page=${pageNo}&limit=${pageSize}`;

      if (trackingId) url += `&tracking_id=${trackingId}`;
      if (fromDate) url += `&from_date=${fromDate}`;
      if (toDate) url += `&to_date=${toDate}`;

      const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setScans(json.data);
      setTotal(json.count);
      setPage(json.page);
      setLimit(json.limit);
    } catch (err: any) {
      setError(err.message || 'Failed to load scans');
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    fetchRouteSummary();
    fetchScans();
  }, [page, limit]);

  useEffect(() => {
    if (distance?.length > 3) {
      fetchRouteSummary();
    }
  }, [distance]);

  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const max = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + max - 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen p-4 text-sm space-y-4">
        {/* FILTER BAR */}
        {/* <div className="bg-white p-3 rounded border flex flex-wrap gap-3 items-end justify-between">
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
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border rounded px-2 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border rounded px-2 py-1.5 text-xs"
              />
            </div>

            <button
              onClick={() => fetchScans(1, limit)}
              className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs hover:bg-gray-900">
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackingId('');
                setFromDate('');
                setToDate('');
                setPage(1);
                fetchScans(1, limit);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs border
               bg-white text-gray-700 hover:bg-gray-50">
              <IconClear />
              Clear
            </button>
            <input
              type="text"
              value={distance}
              placeholder="Route Distance (meters)"
              onChange={e => setDistance(e.target.value)}
              className="border rounded px-2 py-1.5 w-40 text-xs"
            />

            <span className="flex items-center gap-1">
              <span>Total Scans: </span>
              <strong className="text-gray-800">{total}</strong>
            </span>

            
            <button
              type="button"
              disabled={loading}
              onClick={() => fetchScans(page, limit)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition
      ${
        loading
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
              title="Refresh scans">
              <IconRefresh />
              Refresh
            </button>
          </div>

          
          <div className="flex items-center gap-2">
            {['table', 'card'].map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v as any)}
                className={`px-3 py-1.5 text-xs rounded border ${
                  viewMode === v
                    ? 'bg-gray-800 text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div> */}
        <div className="bg-white border rounded-lg px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* LEFT: FILTERS */}
            <div className="flex flex-wrap items-end gap-3">
              {/* Tracking ID */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Tracking ID
                </label>
                <input
                  className="border rounded-md px-2.5 py-2 w-44 text-xs focus:outline-none focus:ring-1 focus:ring-gray-800"
                  placeholder="OUT-7001"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                />
              </div>

              {/* From Date */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="border rounded-md px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="border rounded-md px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              {/* Distance */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Geographic Boundary (meter)
                </label>
                <input
                  type="text"
                  value={distance}
                  placeholder="e.g. 1200"
                  onChange={e => setDistance(e.target.value)}
                  className="border rounded-md px-2.5 py-2 w-44 text-xs focus:outline-none focus:ring-1 focus:ring-gray-800"
                />
              </div>

              {/* SEARCH */}
              <button
                onClick={() => {
                  fetchRouteSummary();
                  fetchScans(1, limit);
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-gray-900 transition">
                Search
              </button>

              {/* CLEAR */}
              <button
                type="button"
                onClick={() => {
                  setTrackingId('');
                  setFromDate('');
                  setToDate('');
                  setPage(1);
                  fetchScans(1, limit);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs border text-gray-700 bg-white hover:bg-gray-50 transition">
                <IconClear />
                Clear
              </button>
            </div>

            {/* RIGHT: STATS & ACTIONS */}
            <div className="flex items-center gap-3">
              {/* TOTAL */}
              <div className="text-xs text-gray-600">
                Total Scans
                <span className="ml-1 font-semibold text-gray-900">
                  {total}
                </span>
              </div>

              {/* REFRESH */}
              <button
                type="button"
                disabled={loading}
                onClick={() => fetchScans(page, limit)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs transition
          ${
            loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
                title="Refresh scans">
                <IconRefresh />
                Refresh
              </button>
              <button
                type="button"
                //onClick={() => exportScansToExcel(scans)}
                onClick={exportAllScans}
                disabled={!scans.length}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs transition
    ${
      scans.length === 0
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
    }`}>
                <IconDownload />
                Export Excel
              </button>

              {/* <div className="flex rounded-md overflow-hidden border">
                {['table', 'card'].map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v as any)}
                    className={`px-3 py-2 text-xs font-medium transition
              ${
                viewMode === v
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
                    {v.toUpperCase()}
                  </button>
                ))}
              </div> */}
            </div>
          </div>
        </div>

        {/* ================= SUMMARY BOXES ================= */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryBox
              label="Total Scans"
              value={summary.total_scans}
              summaryLoading={summaryLoading}
            />
            <SummaryBox
              label="On Route"
              value={summary.on_route}
              color="green"
              summaryLoading={summaryLoading}
            />
            <SummaryBox
              label="Off Route"
              value={summary.off_route}
              color="red"
              summaryLoading={summaryLoading}
            />
          </div>
        )}
        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded border overflow-x-auto">
            {loading ? (
              <p className="p-6">Loading scans…</p>
            ) : error ? (
              <p className="p-6 text-red-600">{error}</p>
            ) : scans.length === 0 ? (
              <p className="p-6">No scans found.</p>
            ) : (
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-100 text-xs text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Tracking ID</th>
                    <th className="px-3 py-2 text-left">Scan Time</th>
                    <th className="px-3 py-2 text-left">Scanned By</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map(s => (
                    <tr key={s.scan_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border font-medium">
                        {s.tracking_id}
                      </td>
                      <td className="px-3 py-2 border text-xs text-gray-600">
                        {new Date(s.scan_datetime).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border text-xs text-gray-600">
                        {s.full_name || s.scanned_by || '—'}
                      </td>
                      <td className="px-3 py-2 border">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            statusStyles[s.status || 'SCANNED'] ||
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {s.status || 'SCANNED'}
                        </span>
                      </td>
                      <td className="px-3 py-2 border">
                        <div className="flex gap-2 flex-wrap">
                          {/* <ActionButton
                            variant="edit"
                            icon={<IconEdit />}
                            label="Edit"
                            onClick={() => {
                              localStorage.setItem(
                                'tracking_id',
                                pkg.tracking_id,
                              );
                              navigate(`/packages/create`);
                            }}
                          /> */}

                          {/* <ActionButton
                            variant="qr"
                            icon={<IconQR />}
                            label="Generate QR"
                            //disabled={s.status !== 'CREATED'}
                            onClick={() => {
                              localStorage.setItem(
                                'tracking_id',
                                s.tracking_id,
                              );
                              //navigate('/packages/generate-qr');
                            }}
                          /> */}
                          <ActionButton
                            label="View All Scans"
                            icon={<IconHistory />}
                            variant="history"
                            onClick={() => {
                              localStorage.setItem(
                                'tracking_id',
                                s.tracking_id,
                              );
                              navigate(`/packages/scan-logs`);
                            }}
                          />
                          {/* <ActionButton
                            variant="print"
                            icon={<IconPrint />}
                            label="Print"
                            disabled={!!s.scan_type}
                            onClick={() => window.print()}
                          /> */}
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
            {scans.map(s => (
              <div
                key={s.scan_id}
                className="bg-white rounded border p-3 hover:shadow-sm">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Tracking ID</p>
                    <p className="text-sm font-semibold">{s.tracking_id}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      statusStyles[s.status || ''] ||
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {s.status || 'SCANNED'}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {new Date(s.scan_datetime).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">By:</span>{' '}
                    {s.full_name || s.scanned_by || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* PAGINATION */}
        <div className="bg-gray-50 border-t px-3 py-2">
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
            {/* LEFT: INFO */}
            <span>
              Showing {total === 0 ? 0 : (page - 1) * limit + 1}–
              {Math.min(page * limit, total)} of {total}
            </span>

            {/* RIGHT: PAGE SIZE + CONTROLS */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Page size */}
              <select
                className="border rounded px-1 py-0.5 text-xs"
                value={limit}
                onChange={e => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}>
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>

              {/* Pagination buttons */}
              <div className="inline-flex items-center gap-1">
                {/* First */}
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  disabled={page === 1 || loading}
                  onClick={() => setPage(1)}>
                  «
                </button>

                {/* Prev */}
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  disabled={page === 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Prev
                </button>

                {/* Page numbers */}
                {getPageNumbers().map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`px-2 py-1 border rounded ${
                      p === page ? 'bg-blue-500 text-white' : 'bg-white'
                    }`}
                    disabled={loading}
                    onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}

                {/* Next */}
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  disabled={page === totalPages || totalPages === 0 || loading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Next
                </button>

                {/* Last */}
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  disabled={page === totalPages || totalPages === 0 || loading}
                  onClick={() => setPage(totalPages)}>
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
const IconClear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
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
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12a9 9 0 1 0 3-6.7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3 4v6h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
/* ================= SUMMARY BOX ================= */
const SummaryBox = ({
  label,
  value,
  color,
  summaryLoading,
}: {
  label: string;
  value: number;
  color?: 'green' | 'red';
  summaryLoading?: boolean;
}) => {
  const colors = {
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`border rounded p-4 ${color ? colors[color] : 'bg-white'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold">
        {summaryLoading ? <ActivityIndicator size={'small'} /> : value}
      </p>
    </div>
  );
};
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
  variant?: 'edit' | 'qr' | 'print' | 'inactive' | 'history' | 'default';
}) {
  const styles: Record<string, string> = {
    edit: 'text-blue-700 border-blue-200 hover:bg-blue-50',
    qr: 'text-indigo-700 border-indigo-200 hover:bg-indigo-50',
    print: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    inactive: 'text-red-700 border-red-200 hover:bg-red-50',
    history: 'text-amber-700 border-amber-200 hover:bg-amber-50',
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
const IconHistory = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12a9 9 0 1 0 3-6.7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3 3v6h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7v5l3 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 5h18l-7 8v6l-4-2v-4L3 5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
const IconInactive = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M5 19L19 5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
