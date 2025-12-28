import React, {useEffect, useState} from 'react';
import AdminLayout from '../AdminLayout';

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
export default function GenerateQR_center({navigation}: any) {
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
  const [centres, setCentres] = useState<any[]>([]);
  //paging
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrStatus, setQrStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [qrMessage, setQrMessage] = useState('');
  const token = localStorage.getItem(TOKEN_KEY);
  const fetchCentres = async () => {
    const res = await fetch(`${API_BASE}/masters/centres`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setCentres(json.data);
  };
  const handleBulkGenerateQR = async () => {
    const isFilterApplied =
      !!centre || !!fromDate || !!toDate || !!trackingId || !!status;

    // 🚫 Guard: At least one filter required
    if (!isFilterApplied) {
      setShowQRModal(true);
      setQrStatus('error');
      setQrMessage(
        'Please apply at least one filter before generating QR codes.',
      );
      return;
    }
    setShowQRModal(true);
    setQrStatus('loading');
    setQrMessage('Generating QR codes for selected packages...');

    try {
      const payload = {
        centre,
        from_date: fromDate,
        to_date: toDate,
        tracking_id: trackingId || null,
        status: status || null,
      };

      const res = await fetch(`${API_BASE}/qrcode/bulk-generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'QR generation failed');
      }

      setQrStatus('success');
      setQrMessage(
        `QR codes generated successfully for ${json.data.generated_count} packages`,
      );

      // 🔁 Refresh list
      fetchPackages(page, limit);
    } catch (err: any) {
      setQrStatus('error');
      setQrMessage(err.message || 'Something went wrong');
    }
  };
  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    fetchCentres();
    fetchPackages(1, 10);
  }, []);
  useEffect(() => {
    const controller = new AbortController();

    fetchPackages(page, limit);
    return () => controller.abort();
  }, [page, limit]);

  const fetchPackages = async (pageNumber: number, pageSize: number) => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE}/packages/ViewPackages?page=${pageNumber}&limit=${pageSize}`;

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
      setPage(json.page); // in case backend normalizes
      setLimit(json.limit);
      setTotal(json.count);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 5; // visible numbered buttons

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const isFilterApplied =
    !!centre || !!fromDate || !!toDate || !!trackingId || !!status;
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
                Exam Centre
              </label>
              {/* <input
                className="border rounded px-2 py-1.5 w-40 text-xs"
                placeholder="Delhi"
                value={centre}
                onChange={e => setCentre(e.target.value)}
              /> */}
              <select
                value={centre}
                onChange={e => setCentre(e.target.value)}
                className="
    w-full
    border
    rounded
    px-2
    py-1.5
    text-sm
    focus:outline-none
    focus:ring-1
    focus:ring-gray-400
  ">
                <option value="">Select Centre</option>
                {centres.map(c => (
                  <option key={c.centre_id} value={c.centre_id}>
                    {c.centre_code} — {c.centre_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                fetchPackages(1, limit);
              }}
              className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs hover:bg-gray-900">
              Search
            </button>
            {/* <button
              onClick={handleBulkGenerateQR}
              disabled={loading || packages.length === 0}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs hover:bg-indigo-700 disabled:opacity-50">
              Generate QR (Filtered)
            </button> */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkGenerateQR}
                disabled={loading || packages.length === 0}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs hover:bg-indigo-700 disabled:opacity-50">
                Generate QR (Filtered)
              </button>

              {/* Filter indicator (display only) */}
              {isFilterApplied && (
                <span
                  title="Filters applied"
                  className="text-gray-400 cursor-not-allowed">
                  <IconFilter />
                </span>
              )}
            </div>
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

                          <ActionButton
                            variant="qr"
                            icon={<IconQR />}
                            label="Generate QR"
                            disabled={pkg.status !== 'CREATED'}
                            onClick={() => {
                              localStorage.setItem(
                                'tracking_id',
                                pkg.tracking_id,
                              );
                              navigate('/packages/generate-qr');
                            }}
                          />

                          <ActionButton
                            variant="print"
                            icon={<IconPrint />}
                            label="Print"
                            disabled={!!pkg.qr_type}
                            onClick={() => window.print()}
                          />

                          <ActionButton
                            variant="inactive"
                            icon={<IconInactive />}
                            label="Inactive"
                            disabled={pkg.status === 'INACTIVE'}
                            onClick={() => alert('Mark inactive')}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-3 py-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        {/* left: info */}
                        <span>
                          Showing {total === 0 ? 0 : (page - 1) * limit + 1}–
                          {Math.min(page * limit, total)} of {total}
                        </span>

                        {/* right: page size + buttons */}
                        <div className="flex items-center gap-3">
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

                            {/* Numbered buttons */}
                            {getPageNumbers().map(p => (
                              <button
                                key={p}
                                type="button"
                                className={`px-2 py-1 border rounded ${
                                  p === page
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white'
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
                              disabled={
                                page === totalPages ||
                                totalPages === 0 ||
                                loading
                              }
                              onClick={() =>
                                setPage(p => Math.min(totalPages, p + 1))
                              }>
                              Next
                            </button>

                            {/* Last */}
                            <button
                              type="button"
                              className="px-2 py-1 border rounded disabled:opacity-50"
                              disabled={
                                page === totalPages ||
                                totalPages === 0 ||
                                loading
                              }
                              onClick={() => setPage(totalPages)}>
                              »
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
        {/* CARD VIEW */}
        {viewMode === 'card' && (
          <>
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
                      variant="edit"
                      icon={<IconEdit />}
                      label="Edit"
                      onClick={() => {
                        localStorage.setItem('tracking_id', pkg.tracking_id);
                        navigate(`/packages/create`);
                      }}
                    />
                    <ActionButton
                      variant="qr"
                      icon={<IconQR />}
                      label="Generate QR"
                      disabled={pkg.status !== 'CREATED'}
                    />
                    <ActionButton
                      variant="print"
                      icon={<IconPrint />}
                      label="Print"
                      disabled={!pkg.qr_type}
                    />
                    <ActionButton
                      variant="inactive"
                      icon={<IconInactive />}
                      label="Inactive"
                      disabled={pkg.status === 'INACTIVE'}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              {/* left: info */}
              <span>
                Showing {total === 0 ? 0 : (page - 1) * limit + 1}–
                {Math.min(page * limit, total)} of {total}
              </span>

              {/* right: page size + buttons */}
              <div className="flex items-center gap-3">
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

                  {/* Numbered buttons */}
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
                    disabled={
                      page === totalPages || totalPages === 0 || loading
                    }
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                    Next
                  </button>

                  {/* Last */}
                  <button
                    type="button"
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    disabled={
                      page === totalPages || totalPages === 0 || loading
                    }
                    onClick={() => setPage(totalPages)}>
                    »
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {showQRModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[360px] p-6 text-center animate-scaleIn">
            {/* LOADING */}
            {qrStatus === 'loading' && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <h3 className="text-sm font-semibold text-gray-800">
                  Generating QR Codes
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Please wait, this may take a moment…
                </p>
              </>
            )}

            {/* SUCCESS */}
            {qrStatus === 'success' && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center animate-pop">
                  ✅
                </div>
                <h3 className="text-sm font-semibold text-green-700">
                  QR Generation Complete
                </h3>
                <p className="text-xs text-gray-600 mt-1">{qrMessage}</p>

                <button
                  onClick={() => setShowQRModal(false)}
                  className="mt-4 px-4 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                  Done
                </button>
              </>
            )}

            {/* ERROR */}
            {qrStatus === 'error' && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  ❌
                </div>
                <h3 className="text-sm font-semibold text-red-700">
                  QR Generation Failed
                </h3>
                <p className="text-xs text-gray-600 mt-1">{qrMessage}</p>

                <button
                  onClick={() => setShowQRModal(false)}
                  className="mt-4 px-4 py-1.5 text-xs bg-gray-700 text-white rounded">
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
  variant?: 'edit' | 'qr' | 'print' | 'inactive' | 'default';
}) {
  const styles: Record<string, string> = {
    edit: 'text-blue-700 border-blue-200 hover:bg-blue-50',
    qr: 'text-indigo-700 border-indigo-200 hover:bg-indigo-50',
    print: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    inactive: 'text-red-700 border-red-200 hover:bg-red-50',
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
