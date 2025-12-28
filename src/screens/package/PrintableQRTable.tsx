import React from 'react';

type QRRow = {
  tracking_id: string;
  qr_type: 'OUTER' | 'INNER';
  outer_tracking_id?: string;
  exam_date?: string;
  status: string;
  qr_image_url: string;
};

export default function PrintableQRTable({
  centreName,
  data,
}: {
  centreName: string;
  data: QRRow[];
}) {
  return (
    <div className="print-area p-6 text-sm">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold">QR Code Summary</h2>
        <p className="text-sm text-gray-600">
          Centre: <strong>{centreName}</strong>
        </p>
        <p className="text-xs text-gray-500">
          Generated on: {new Date().toLocaleString()}
        </p>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-2">Type</th>
            <th className="border px-2 py-2">Tracking ID</th>
            <th className="border px-2 py-2">Outer Tracking</th>
            <th className="border px-2 py-2">Exam Date</th>
            <th className="border px-2 py-2">Status</th>
            <th className="border px-2 py-2">QR Code</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-2 font-semibold">{row.qr_type}</td>
              <td className="border px-2 py-2">{row.tracking_id}</td>
              <td className="border px-2 py-2">
                {row.outer_tracking_id || '-'}
              </td>
              <td className="border px-2 py-2">
                {row.exam_date
                  ? new Date(row.exam_date).toLocaleDateString()
                  : '-'}
              </td>
              <td className="border px-2 py-2">{row.status}</td>
              <td className="border px-2 py-2">
                <img
                  src={row.qr_image_url}
                  alt="QR"
                  className="h-20 w-20 mx-auto"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
