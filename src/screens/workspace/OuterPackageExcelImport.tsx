import React, {useEffect, useState} from 'react';
import * as XLSX from 'xlsx';
import AdminLayout from '../AdminLayout';
import CryptoJS from 'crypto-js';
import {API_BASE, QR_IV, QR_SECRET} from '@env';
const QR_IV_Parse = CryptoJS.enc.Utf8.parse(QR_IV);
const TOKEN_KEY = 'nta_token';
const CHUNK_SIZE = 5000;

const OUTER_COLUMNS = [
  {key: 'tracking_id', label: 'Tracking ID', required: true},
  {key: 'destination_centre_id', label: 'Centre ID'},
  {key: 'encrypted_qr_payload', label: 'QR Payload', required: true},
  {key: 'status', label: 'Status'},
  {key: 'dispatch_datetime', label: 'Dispatch Date'},
  {key: 'return_dispatch_datetime', label: 'Return Date'},
];

const INNER_COLUMNS = [
  {key: 'tracking_id', label: 'Tracking ID', required: true},
  {key: 'outer_package_id', label: 'Outer Package', required: true},
  {key: 'centre_id', label: 'Centre ID', required: true},
  {key: 'exam_date', label: 'Exam Date'},
  {key: 'encrypted_qr_payload', label: 'QR Payload', required: true},
];

const AUTO_MAP: Record<string, string> = {
  tracking: 'tracking_id',
  outer: 'outer_package_id',
  centre: 'centre_id',
  center: 'centre_id',
  qr: 'encrypted_qr_payload',
  payload: 'encrypted_qr_payload',
  status: 'status',
  dispatch: 'dispatch_datetime',
  return: 'return_dispatch_datetime',
  exam: 'exam_date',
};

export default function PackageExcelImport() {
  const token = localStorage.getItem(TOKEN_KEY);

  const [packageType, setPackageType] = useState<'OUTER' | 'INNER'>('OUTER');
  const [outerPackages, setOuterPackages] = useState<any[]>([]);
  const [selectedOuter, setSelectedOuter] = useState('');

  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({uploaded: 0, total: 0});

  const TABLE_COLUMNS = packageType === 'OUTER' ? OUTER_COLUMNS : INNER_COLUMNS;

  /* ================= LOAD OUTER PACKAGES ================= */
  useEffect(() => {
    if (packageType === 'INNER') {
      fetchOuterPackages();
    }
  }, [packageType]);

  const fetchOuterPackages = async () => {
    const res = await fetch(`${API_BASE}/packages?page=1&limit=100`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setOuterPackages(json.data);
  };

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
  const missingRequired = TABLE_COLUMNS.filter(
    col => col.required && !Object.values(mapping).includes(col.key),
  );

  const canUpload =
    missingRequired.length === 0 && (packageType === 'OUTER' || selectedOuter);

  /* ================= UPLOAD ================= */
  const handleSubmit = async () => {
    const mappedRows = rows.map(r => {
      const obj: any = {};

      Object.entries(mapping).forEach(([excelCol, dbCol]) => {
        if (dbCol) obj[dbCol] = r[excelCol];
      });
      if (obj.encrypted_qr_payload) {
        const encrypted = CryptoJS.AES.encrypt(
          obj.encrypted_qr_payload,
          CryptoJS.enc.Utf8.parse(QR_SECRET),
          {iv: QR_IV_Parse},
        ).toString();
        obj.encrypted_qr_payload = encrypted;
      }
      //   if (packageType === 'INNER') {
      //     obj.outer_package_id = selectedOuter;
      //   }
      return obj;
    });
    debugger;
    setUploading(true);
    setProgress({uploaded: 0, total: mappedRows.length});

    const endpoint =
      packageType === 'OUTER'
        ? '/packages/bulk-upload'
        : '/packages/bulk-upload-inner';

    for (let i = 0; i < mappedRows.length; i += CHUNK_SIZE) {
      const chunk = mappedRows.slice(i, i + CHUNK_SIZE);

      await fetch(`${API_BASE}${endpoint}`, {
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
    alert('Upload completed');
  };

  const filteredHeaders = excelHeaders.filter(h =>
    h.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="p-4 bg-white rounded shadow max-w-6xl">
        <h2 className="text-base font-semibold mb-2">Excel Package Import</h2>

        {/* Package Type */}
        <div className="flex gap-4 mb-3 text-sm">
          <label>
            <input
              type="radio"
              checked={packageType === 'OUTER'}
              onChange={() => setPackageType('OUTER')}
            />{' '}
            Outer Package
          </label>
          <label>
            <input
              type="radio"
              checked={packageType === 'INNER'}
              onChange={() => setPackageType('INNER')}
            />{' '}
            Inner Package
          </label>
        </div>

        {/* Outer Package Selector */}
        {/* {packageType === 'INNER' && (
          <>
            <select
              className="border px-2 py-1 text-sm mb-3"
              value={selectedOuter}
              onChange={e => setSelectedOuter(e.target.value)}>
              <option value="">Select Outer Package</option>
              {outerPackages.map(op => (
                <option key={op.outer_package_id} value={op.outer_package_id}>
                  {op.tracking_id}
                </option>
              ))}
            </select>
          </>
        )} */}
        <div>
          <input
            type="file"
            accept=".xlsx,.csv"
            disabled={uploading}
            onChange={e =>
              e.target.files && handleFileUpload(e.target.files[0])
            }
          />
        </div>
        {/* Mapping UI (same as before) */}
        {excelHeaders.length > 0 && (
          <div>
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
                    {TABLE_COLUMNS.map(c => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              //disabled={!canUpload || uploading}
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white px-4 py-1.5 text-sm rounded">
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
