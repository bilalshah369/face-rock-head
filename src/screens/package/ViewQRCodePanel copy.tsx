import React from 'react';

type QRItem = {
  qr_image_url: string;
  encrypted_payload: string;
  label?: string;
};

type Props = {
  outerQr?: QRItem | null;
  innerQrs?: QRItem[];
};

export default function ViewQRCodePanel({outerQr, innerQrs}: Props) {
  if (!outerQr && (!innerQrs || innerQrs.length === 0)) {
    return (
      <div className="border rounded p-6 bg-gray-50 text-gray-500">
        Select a package to view QR codes
      </div>
    );
  }

  const printQr = (url: string) => {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <body style="margin:0;display:flex;justify-content:center;align-items:center">
          <img src="${url}" onload="window.print();window.close()" />
        </body>
      </html>
    `);
  };

  return (
    <div className="border rounded p-6 bg-white space-y-6">
      <h3 className="text-lg font-semibold">QR Codes</h3>

      {/* OUTER QR */}
      {outerQr && (
        <div className="border rounded p-4">
          <p className="font-medium mb-2">Outer Package QR</p>
          <img
            src={`${outerQr.qr_image_url}?t=${Date.now()}`}
            className="w-40 h-40 border"
          />
          <div className="flex gap-4 mt-2 text-sm">
            <a href={outerQr.qr_image_url} download className="underline">
              Download
            </a>
            <button
              onClick={() => printQr(outerQr.qr_image_url)}
              className="underline">
              Print
            </button>
          </div>
        </div>
      )}

      {/* INNER QRs */}
      {innerQrs && innerQrs.length > 0 && (
        <div>
          <p className="font-medium mb-3">Inner Package QRs</p>
          <div className="grid grid-cols-2 gap-4">
            {innerQrs.map((qr, idx) => (
              <div key={idx} className="border rounded p-3 bg-gray-50">
                <img src={qr.qr_image_url} className="w-32 h-32 border" />
                <div className="flex gap-3 mt-2 text-xs">
                  <a href={qr.qr_image_url} download className="underline">
                    Download
                  </a>
                  <button
                    onClick={() => printQr(qr.qr_image_url)}
                    className="underline">
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
