import React, {useState} from 'react';
import * as XLSX from 'xlsx';
import AdminLayout from '../AdminLayout';
import CryptoJS from 'crypto-js';
import {API_BASE, QR_IV, QR_SECRET} from '@env';

const QR_IV_Parse = CryptoJS.enc.Utf8.parse(QR_IV);
const TOKEN_KEY = 'nta_token';
const CHUNK_SIZE = 5000;

const STUDENT_COLUMNS = [
  {key: 'application_ref_no', label: 'Application Ref No', required: true},
  {key: 'student_first_name', label: 'First Name', required: true},
  {key: 'student_last_name', label: 'Last Name'},
  {key: 'date_of_birth', label: 'Date of Birth'},
  {key: 'gender', label: 'Gender'},
  {key: 'email', label: 'Email'},
  {key: 'mobile_no', label: 'Mobile No', required: true},
  {key: 'exam_name', label: 'Exam Name', required: true},
  {key: 'exam_date', label: 'Exam Date', required: true},
  {key: 'shift', label: 'Shift', required: true},
  {key: 'photo', label: 'Photo'},
  {key: 'encrypted_qr_payload', label: 'QR Payload'},
  {key: 'application_status', label: 'Application Status'},
  {key: 'payment_status', label: 'Payment Status'},
];

const AUTO_MAP: Record<string, string> = {
  application: 'application_ref_no',
  ref: 'application_ref_no',
  first: 'student_first_name',
  last: 'student_last_name',
  dob: 'date_of_birth',
  birth: 'date_of_birth',
  gender: 'gender',
  email: 'email',
  mobile: 'mobile_no',
  phone: 'mobile_no',
  exam: 'exam_name',
  date: 'exam_date',
  shift: 'shift',
  qr: 'encrypted_qr_payload',
  status: 'application_status',
  payment: 'payment_status',
};

export default function StudentExcelImport() {
  const token = localStorage.getItem(TOKEN_KEY);

  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({uploaded: 0, total: 0});

  /* ================= READ EXCEL ================= */
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target?.result, {type: 'binary'});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {defval: ''});
      if (!json.length) return;

      const headers = Object.keys(json[0] as any);
      const autoMapped: Record<string, string> = {};

      headers.forEach(h => {
        const key = h.toLowerCase();
        Object.keys(AUTO_MAP).forEach(m => {
          if (key.includes(m)) autoMapped[h] = AUTO_MAP[m];
        });
      });

      setExcelHeaders(headers);
      setRows(json);
      setMapping(autoMapped);
    };
    reader.readAsBinaryString(file);
  };

  /* ================= VALIDATION ================= */
  const missingRequired = STUDENT_COLUMNS.filter(
    col => col.required && !Object.values(mapping).includes(col.key),
  );

  /* ================= UPLOAD ================= */
  const handleSubmit = async () => {
    const mappedRows = rows.map(r => {
      const obj: any = {};

      Object.entries(mapping).forEach(([excelCol, dbCol]) => {
        if (dbCol) obj[dbCol] = r[excelCol];
      });

      if (obj.encrypted_qr_payload) {
        obj.encrypted_qr_payload = CryptoJS.AES.encrypt(
          obj.encrypted_qr_payload,
          CryptoJS.enc.Utf8.parse(QR_SECRET),
          {iv: QR_IV_Parse},
        ).toString();
      }

      return obj;
    });

    setUploading(true);
    setProgress({uploaded: 0, total: mappedRows.length});

    for (let i = 0; i < mappedRows.length; i += CHUNK_SIZE) {
      const chunk = mappedRows.slice(i, i + CHUNK_SIZE);

      await fetch(`${API_BASE}/student-applications/bulk-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({rows: chunk}),
      });

      setProgress(p => ({
        ...p,
        uploaded: Math.min(p.uploaded + chunk.length, p.total),
      }));
    }

    setUploading(false);
    alert('Student applications uploaded successfully');
  };

  const filteredHeaders = excelHeaders.filter(h =>
    h.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="p-4 bg-white rounded shadow max-w-6xl">
        <h2 className="text-base font-semibold mb-2">
          Student Applications Excel Import
        </h2>

        <input
          type="file"
          accept=".xlsx,.csv"
          disabled={uploading}
          onChange={e => e.target.files && handleFileUpload(e.target.files[0])}
        />

        {excelHeaders.length > 0 && (
          <>
            <input
              placeholder="Search column"
              className="border px-2 py-1 text-xs my-2"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {missingRequired.length > 0 && (
              <div className="text-xs text-red-600">
                Missing: {missingRequired.map(m => m.label).join(', ')}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mt-2">
              {filteredHeaders.map(h => (
                <div key={h}>
                  <label className="text-xs">{h}</label>
                  <select
                    value={mapping[h] || ''}
                    className="w-full border px-2 py-1 text-xs"
                    onChange={e =>
                      setMapping(p => ({...p, [h]: e.target.value}))
                    }>
                    <option value="">Select</option>
                    {STUDENT_COLUMNS.map(c => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              disabled={uploading || missingRequired.length > 0}
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white px-4 py-1.5 text-sm rounded">
              {uploading
                ? `Uploading ${progress.uploaded}/${progress.total}`
                : 'Upload'}
            </button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
