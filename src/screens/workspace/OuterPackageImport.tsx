import React, {useState} from 'react';
import * as XLSX from 'xlsx';
import AdminLayout from '../AdminLayout';

const CHUNK_SIZE = 5000;

const TABLE_COLUMNS = [
  {key: 'tracking_id', label: 'Tracking ID', required: true},
  {key: 'destination_centre_id', label: 'Centre ID'},
  {key: 'encrypted_qr_payload', label: 'QR Payload', required: true},
  {key: 'status', label: 'Status'},
  {key: 'dispatch_datetime', label: 'Dispatch Date'},
  {key: 'return_dispatch_datetime', label: 'Return Date'},
];

export default function OuterPackageExcelImport() {
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({uploaded: 0, total: 0});

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target?.result, {type: 'binary'});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {defval: ''});
      if (!json.length) return;

      setExcelHeaders(Object.keys(json[0] as any));
      setRows(json);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    const mappedRows = rows.map(row => {
      const obj: any = {};
      Object.entries(mapping).forEach(([excelCol, dbCol]) => {
        if (dbCol) obj[dbCol] = row[excelCol];
      });
      return obj;
    });

    setUploading(true);
    setProgress({uploaded: 0, total: mappedRows.length});

    for (let i = 0; i < mappedRows.length; i += CHUNK_SIZE) {
      const chunk = mappedRows.slice(i, i + CHUNK_SIZE);

      // await axios.post('/api/outer-packages/bulk-upload', { rows: chunk });

      setProgress(prev => ({
        ...prev,
        uploaded: Math.min(prev.uploaded + chunk.length, prev.total),
      }));
    }

    setUploading(false);
    alert('Upload completed');
  };

  return (
    <AdminLayout>
      <div className="p-4 bg-white rounded-md shadow-sm max-w-5xl">
        <h2 className="text-base font-semibold mb-3">
          Outer Package – Excel Import
        </h2>

        {/* File Upload */}
        <input
          type="file"
          accept=".xlsx,.csv"
          disabled={uploading}
          className="text-sm"
          onChange={e => e.target.files && handleFileUpload(e.target.files[0])}
        />

        {/* Mapping */}
        {excelHeaders.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {excelHeaders.map(header => (
                <div key={header}>
                  <label className="text-xs text-gray-500">{header}</label>
                  <select
                    disabled={uploading}
                    className="w-full border rounded px-2 py-1 text-xs"
                    onChange={e =>
                      setMapping(prev => ({
                        ...prev,
                        [header]: e.target.value,
                      }))
                    }>
                    <option value="">Ignore</option>
                    {TABLE_COLUMNS.map(col => (
                      <option key={col.key} value={col.key}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Progress */}
            {uploading && (
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-1">
                  {progress.uploaded} / {progress.total}
                </div>
                <div className="w-full bg-gray-200 rounded h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded"
                    style={{
                      width: `${(progress.uploaded / progress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <button
              disabled={uploading}
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white px-4 py-1.5 rounded text-sm">
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
