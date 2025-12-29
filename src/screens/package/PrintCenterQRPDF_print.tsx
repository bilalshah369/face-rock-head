import React, {useState} from 'react';
import jsPDF from 'jspdf';
import {API_BASE} from '@env';

const TOKEN_KEY = 'nta_token';

type QRRow = {
  tracking_id: string;
  qr_type: 'OUTER' | 'INNER';
  outer_tracking_id?: string;
  exam_date?: string;
  status: string;
  qr_image_url: string;
  centre_code: string;
  centre_name: string;
};

export default function PrintCenterQRPDF_print({
  centreId,
  trackingId,
}: {
  centreId?: string;
  trackingId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const token = localStorage.getItem(TOKEN_KEY);

  const generatePDF = async () => {
    setLoading(true);

    try {
      const url = trackingId
        ? `${API_BASE}/qrcode/get/${trackingId}`
        : `${API_BASE}/qrcode/print-centre-wise?centre=${centreId}`;

      const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
      });

      const json = await res.json();
      if (!json.success) throw new Error('Failed to load QR data');

      const rows: QRRow[] = Array.isArray(json.data) ? json.data : [json.data];
      /* ================= DATA ================= */
      const outers = rows.filter(r => r.qr_type === 'OUTER');
      const inners = rows.filter(r => r.qr_type === 'INNER');

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      /* ================= HEADER ================= */
      let y = 15;

      doc.setFontSize(18);
      doc.text('PACKAGE QR CODE SHEET', pageWidth / 2, y, {align: 'center'});

      y += 8;
      doc.setFontSize(11);
      doc.text('Exam Name: National Level Examination', 15, y);
      doc.text('Exam Date: 15-Apr-2025', pageWidth - 15, y, {align: 'right'});

      y += 6;
      doc.text(`Centre Code: ${outers[0].centre_code || 'CENT-001'}`, 15, y);
      doc.text(`Centre Name: ${outers[0].centre_name}`, pageWidth - 15, y, {
        align: 'right',
      });

      y += 5;
      doc.setLineWidth(0.5);
      doc.line(10, y, pageWidth - 10, y);

      y += 8;

      /* ========== OUTER PACKAGE (HIGHLIGHTED) ========== */
      for (const outer of outers) {
        if (y + 50 > pageHeight) {
          doc.addPage();
          y = 15;
        }

        doc.setFillColor(235, 245, 255);
        doc.rect(10, y, pageWidth - 20, 45, 'F');

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('OUTER PACKAGE', 15, y + 7);

        doc.setFontSize(10);
        doc.text(`Tracking ID: ${outer.tracking_id}`, 15, y + 15);
        doc.text(`Centre Code: ${outer.centre_code || 'CENT-001'}`, 15, y + 22);
        doc.text('Exam: National Level Examination', 15, y + 29);
        doc.text('Exam Date: 15-Apr-2025', 15, y + 36);

        const outerQR = await imageToBase64(outer.qr_image_url);
        doc.addImage(outerQR, 'PNG', pageWidth - 60, y + 8, 35, 35);

        y += 55;
      }

      /* ========== INNER PACKAGES (2 PER ROW) ========== */
      const cardWidth = (pageWidth - 30) / 2;
      const cardHeight = 55;
      let x = 10;

      for (let i = 0; i < inners.length; i++) {
        if (y + cardHeight > pageHeight) {
          doc.addPage();
          y = 15;
          x = 10;
        }

        const inner = inners[i];

        doc.setDrawColor(200);
        doc.rect(x, y, cardWidth, cardHeight);

        doc.setFontSize(10);
        doc.text('INNER PACKAGE', x + 5, y + 7);
        doc.text(`Tracking ID: ${inner.tracking_id}`, x + 5, y + 14);
        doc.text(`Status: ${inner.status}`, x + 5, y + 21);

        const innerQR = await imageToBase64(inner.qr_image_url);
        doc.addImage(innerQR, 'PNG', x + cardWidth - 30, y + 18, 25, 25);

        if (i % 2 === 0) {
          x += cardWidth + 10;
        } else {
          x = 10;
          y += cardHeight + 8;
        }
      }

      /* ================= OUTPUT ================= */
      const blob = doc.output('blob');
      const urlBlob = URL.createObjectURL(blob);
      setPdfUrl(urlBlob);
    } catch (err: any) {
      alert(err.message || 'PDF generation failed');
    } finally {
      setLoading(false);
    }
  };

  const imageToBase641 = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    //debugger;
    return new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };
  const imageToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url, {mode: 'cors'});

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status}`);
    }

    const blob = await res.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={generatePDF}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
        {loading ? 'Generating PDF…' : 'Generate QR PDF'}
      </button>

      {pdfUrl && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
          {/* PDF Viewer */}
          <div className="bg-white border-b">
            <iframe
              src={`${pdfUrl}#${Date.now()}`}
              className="w-full h-[600px] bg-white"
              title="QR PDF"
              style={{
                backgroundColor: '#ffffff', //  forces light background
              }}
            />
          </div>

          {/* Footer / Actions */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
            <span className="text-xs text-gray-500">PDF Preview</span>

            <a
              href={pdfUrl}
              download={trackingId ? `${trackingId}-qr.pdf` : `centre-qr.pdf`}
              className="inline-flex items-center gap-1.5 text-sm font-medium
                   text-gray-700 hover:text-gray-900 transition">
              ⬇ Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
