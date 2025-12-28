import React, {useEffect, useState} from 'react';
import jsPDF from 'jspdf';
import {API_BASE} from '@env';

const TOKEN_KEY = 'nta_token';

type CentreQRItem = {
  centre_name: string;
  centre_code: string;
  tracking_id: string;
  outer_qr: string; // image URL or base64
  inner_qrs: string[]; // image URLs or base64
};

export default function PrintCenterQRPDF({centreId}: {centreId: string}) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const token = localStorage.getItem(TOKEN_KEY);

  const generatePDF = async () => {
    setLoading(true);

    const res = await fetch(
      `${API_BASE}/qrcode/print-centre-wise?centre=${centreId}`,
      {
        headers: {Authorization: `Bearer ${token}`},
      },
    );

    const json = await res.json();
    if (!json.success) {
      setLoading(false);
      return alert('Failed to load QR data');
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;

    for (const item of json.data as CentreQRItem[]) {
      doc.setFontSize(14);
      doc.text(`${item.centre_code} - ${item.centre_name}`, 10, y);
      y += 8;

      doc.setFontSize(12);
      doc.text(`Tracking ID: ${item.tracking_id}`, 10, y);
      y += 6;

      // Outer QR
      doc.text('Outer QR', 10, y);
      y += 4;
      doc.addImage(item.outer_qr, 'PNG', 10, y, 40, 40);
      y += 45;

      // Inner QRs
      doc.text('Inner QRs', 10, y);
      y += 4;

      let x = 10;
      for (const qr of item.inner_qrs) {
        if (x > 150) {
          x = 10;
          y += 45;
        }
        doc.addImage(qr, 'PNG', x, y, 40, 40);
        x += 45;
      }

      y += 50;

      // New page if needed
      if (y > 260) {
        doc.addPage();
        y = 10;
      }
    }

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setLoading(false);
  };

  return (
    <div className="bg-white border rounded p-4 space-y-4">
      <button
        onClick={generatePDF}
        disabled={loading}
        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
        {loading ? 'Generating PDF…' : 'Generate Centre QR PDF'}
      </button>

      {/* PDF Preview */}
      {pdfUrl && (
        <div className="border rounded overflow-hidden">
          <iframe
            src={pdfUrl}
            title="QR PDF Preview"
            className="w-full h-[600px]"
          />
          <div className="p-2 text-right">
            <a
              href={pdfUrl}
              download={`centre-qr-codes.pdf`}
              className="text-sm text-indigo-600 underline">
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
