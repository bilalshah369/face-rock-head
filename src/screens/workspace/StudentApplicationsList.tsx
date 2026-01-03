import React, {useEffect, useState} from 'react';
import AdminLayout from '../AdminLayout';
import {API_BASE} from '@env';
import {useNavigate} from 'react-router-dom';
import QRInfoModal from '../modals/QRInfoModal';

const TOKEN_KEY = 'nta_token';

/* ================= TYPES ================= */
type StudentItem = {
  id: number;
  application_ref_no: string;
  student_first_name: string;
  student_last_name?: string;
  mobile_no: string;
  exam_name: string;
  exam_date: string;
  shift: string;
  application_status: string;
  payment_status: string;
  created_at: string;
};

/* ================= STATUS STYLES ================= */
const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function StudentApplicationsList({navigation}: any) {
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);

  /* ================= STATE ================= */
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [applicationRef, setApplicationRef] = useState('');
  const [examName, setExamName] = useState('');
  const [shift, setShift] = useState('');
  const [status, setStatus] = useState('');

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [qrLoading, setQrLoading] = useState(false);
  const [qrResult, setQrResult] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>();
  const toggleSelect = (refNo: string) => {
    setSelectedRefs(prev => {
      const next = new Set(prev);
      next.has(refNo) ? next.delete(refNo) : next.add(refNo);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRefs.size === students.length) {
      setSelectedRefs(new Set());
    } else {
      setSelectedRefs(new Set(students.map(s => s.application_ref_no)));
    }
  };
  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    fetchStudents(1, limit);
  }, []);

  useEffect(() => {
    fetchStudents(page, limit);
  }, [page, limit]);

  /* ================= FETCH ================= */
  const fetchStudents = async (pageNumber: number, pageSize: number) => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE}/student-applications/ViewStudentApplications?page=${pageNumber}&limit=${pageSize}`;

      if (applicationRef)
        url += `&application_ref_no=${encodeURIComponent(applicationRef)}`;
      if (examName) url += `&exam_name=${encodeURIComponent(examName)}`;
      if (shift) url += `&shift=${shift}`;
      if (status) url += `&status=${status}`;

      const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
      });

      const json = await res.json();
      if (!json.success) throw new Error('Failed to fetch students');

      setStudents(json.data);
      setTotal(json.count);
      setPage(json.page);
      setLimit(json.limit);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 5;

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
  const handleSelectedGenerateQR = async () => {
    if (selectedRefs.size === 0) {
      alert('Please select at least one student');
      return;
    }

    if (
      !window.confirm(
        `Generate QR codes for ${selectedRefs.size} selected students?`,
      )
    ) {
      return;
    }

    setQrLoading(true);
    setQrResult(null);

    try {
      const res = await fetch(
        `${API_BASE}/student-applications/bulk-generate-qr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            application_ref_nos: Array.from(selectedRefs),
          }),
        },
      );

      const json = await res.json();
      if (!json.success) throw new Error('QR generation failed');

      setQrResult(json.data);
      setSelectedRefs(new Set()); // clear selection

      alert(
        `QR Generated!
Total: ${json.data.total}
Generated: ${json.data.generated_count}
Failed: ${json.data.failed_count}`,
      );

      fetchStudents(page, limit);
    } catch (err: any) {
      alert(err.message || 'QR generation failed');
    } finally {
      setQrLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (selectedRefs.size > 0) {
      return handleSelectedGenerateQR();
    }
    //return;
    if (!students.length) {
      alert('No student records available');
      return;
    }

    if (!window.confirm('Generate QR codes for filtered students?')) {
      return;
    }

    setQrLoading(true);
    setQrResult(null);

    try {
      const payload: any = {};

      if (applicationRef) payload.application_ref_no = applicationRef;
      if (examName) payload.exam_name = examName;
      if (shift) payload.shift = shift;
      if (status) payload.status = status;

      const res = await fetch(
        `${API_BASE}/student-applications/bulk-generate-qr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();
      if (!json.success) throw new Error('QR generation failed');

      setQrResult(json.data);

      alert(
        `QR Generated!\n\nTotal: ${json.data.total}\nGenerated: ${json.data.generated_count}\nFailed: ${json.data.failed_count}`,
      );
    } catch (err: any) {
      alert(err.message || 'QR generation failed');
    } finally {
      setQrLoading(false);
    }
  };
  const viewQr = (item: any) => {
    setSelectedStudent(item);
    setOpen(true);
  };
  const hasAnyFilter =
    applicationRef.trim() ||
    examName.trim() ||
    shift ||
    status ||
    selectedRefs.size > 0;
  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen p-4 text-sm space-y-4">
        {/* FILTER BAR */}
        <div className="bg-white p-3 rounded border flex flex-wrap gap-3 items-end justify-between">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">
                Application Ref
              </label>
              <input
                className="border rounded px-2 py-1.5 w-40 text-xs"
                placeholder="APP-2025-001"
                value={applicationRef}
                onChange={e => setApplicationRef(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Exam Name
              </label>
              <input
                className="border rounded px-2 py-1.5 w-40 text-xs"
                placeholder="SSC"
                value={examName}
                onChange={e => setExamName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Shift</label>
              <select
                className="border rounded px-2 py-1.5 w-36 text-xs"
                value={shift}
                onChange={e => setShift(e.target.value)}>
                <option value="">All</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                className="border rounded px-2 py-1.5 w-36 text-xs"
                value={status}
                onChange={e => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              onClick={() => fetchStudents(1, limit)}
              className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs hover:bg-gray-900">
              Search
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateQR}
              disabled={qrLoading || !hasAnyFilter}
              className={`px-4 py-1.5 text-xs rounded text-white ${
                qrLoading || !hasAnyFilter
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}>
              {qrLoading ? 'Generating QR…' : 'Generate QR Codes'}
            </button>

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
        {qrResult && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-xs">
            <b>QR Generation Summary</b>
            <div>Total: {qrResult.total}</div>
            <div>Generated: {qrResult.generated_count}</div>
            <div>Failed: {qrResult.failed_count}</div>

            {qrResult.failed_application_refs?.length > 0 && (
              <div className="mt-1 text-red-600">
                Failed Ref Nos: {qrResult.failed_application_refs.join(', ')}
              </div>
            )}
          </div>
        )}
        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded border overflow-x-auto">
            {loading ? (
              <p className="p-6">Loading students...</p>
            ) : error ? (
              <p className="p-6 text-red-600">{error}</p>
            ) : students.length === 0 ? (
              <p className="p-6">No students found.</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-100 text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={
                          students.length > 0 &&
                          selectedRefs.size === students.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left">Application Ref</th>
                    <th className="px-3 py-2 text-left">Student</th>
                    <th className="px-3 py-2 text-left">Exam</th>
                    <th className="px-3 py-2 text-left">Shift</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Created</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border">
                        <input
                          type="checkbox"
                          checked={selectedRefs.has(s.application_ref_no)}
                          onChange={() => toggleSelect(s.application_ref_no)}
                        />
                      </td>
                      <td className="px-3 py-2 border font-medium">
                        {s.application_ref_no}
                      </td>
                      <td className="px-3 py-2 border">
                        {s.student_first_name} {s.student_last_name}
                        <div className="text-xs text-gray-500">
                          {s.mobile_no}
                        </div>
                      </td>
                      <td className="px-3 py-2 border">
                        {s.exam_name}
                        <div className="text-xs text-gray-500">
                          {new Date(s.exam_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 py-2 border">{s.shift}</td>
                      <td className="px-3 py-2 border">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            statusStyles[s.application_status]
                          }`}>
                          {s.application_status}
                        </span>
                      </td>
                      <td className="px-3 py-2 border text-xs text-gray-500">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border">
                        <div className="flex gap-2 flex-wrap">
                          <ActionButton
                            variant="edit"
                            icon={<IconEdit />}
                            label="Edit"
                            onClick={() => {
                              localStorage.setItem(
                                'tracking_id',
                                s.application_ref_no,
                              );
                              navigate(`/packages/create`);
                            }}
                          />

                          <ActionButton
                            variant="qr"
                            icon={<IconQR />}
                            label="View QR Code"
                            disabled={s.application_status === 'PENDING'}
                            // onClick={() => {
                            //   localStorage.setItem(
                            //     'tracking_id',
                            //     s.application_ref_no,
                            //   );
                            //   navigate('/packages/generate-qr');
                            // }}
                            onClick={() => viewQr(s)}
                          />

                          <ActionButton
                            variant="print"
                            icon={<IconPrint />}
                            label="Print"
                            //disabled={!!s.qr_type}
                            onClick={() => window.print()}
                          />

                          <ActionButton
                            variant="inactive"
                            icon={<IconInactive />}
                            label="Inactive"
                            // disabled={pkg.status === 'INACTIVE'}
                            onClick={() => alert('Mark inactive')}
                          />
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
            {students.map(s => (
              <div
                key={s.id}
                className="bg-white rounded border p-3 hover:shadow-sm">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Application</p>
                    <p className="font-semibold text-sm">
                      {s.application_ref_no}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      statusStyles[s.application_status]
                    }`}>
                    {s.application_status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <b>Student:</b> {s.student_first_name} {s.student_last_name}
                  </p>
                  <p>
                    <b>Mobile:</b> {s.mobile_no}
                  </p>
                  <p>
                    <b>Exam:</b> {s.exam_name}
                  </p>
                  <p>
                    <b>Date:</b> {new Date(s.exam_date).toLocaleDateString()}
                  </p>
                  <p>
                    <b>Shift:</b> {s.shift}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
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
      <QRInfoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        qrImageUrl={selectedStudent?.qr_image_url}
        title={`${selectedStudent?.student_first_name} ${
          selectedStudent?.student_last_name ?? ''
        } (${selectedStudent?.exam_name})`}
        info={[
          {
            label: 'Application Ref No',
            value: selectedStudent?.application_ref_no,
          },
          {
            label: 'Mobile Number',
            value: selectedStudent?.mobile_no,
          },
          {
            label: 'Exam Name',
            value: selectedStudent?.exam_name,
          },
          {
            label: 'Exam Date',
            value: selectedStudent?.exam_date,
          },
          {
            label: 'Shift',
            value: selectedStudent?.shift,
          },
          {
            label: 'Application Status',
            value: selectedStudent?.application_status,
          },
          {
            label: 'Payment Status',
            value: selectedStudent?.payment_status,
          },
          {
            label: 'Created At',
            value: new Date(selectedStudent?.created_at ?? '').toLocaleString(),
          },
        ]}
        description={selectedStudent?.encrypted_payload}
      />
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

const IconInactive = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M5 19L19 5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
