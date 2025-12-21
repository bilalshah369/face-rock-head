import React from 'react';

type QRItem = {
  qr_image_url: string;
  encrypted_payload: string;
  tracking_id?: string;
  qr_type?: 'OUTER' | 'INNER';
};

type Props = {
  outerQr?: QRItem | null;
  innerQrs?: QRItem[];
};

export default function ViewQRCodePanel({outerQr, innerQrs}: Props) {
  if (!outerQr && (!innerQrs || innerQrs.length === 0)) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-gray-500 text-sm text-center">
        No QR selected
        <div className="text-xs mt-1 text-gray-400">
          Select an outer or inner package to preview QR
        </div>
      </div>
    );
  }

  const printQr = (url: string) => {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <body style="margin:0;display:flex;justify-content:center;align-items:center">
          <img src="${url}" style="width:300px" onload="window.print();window.close()" />
        </body>
      </html>
    `);
  };

  const copyText = async (text?: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-6">
      {/* OUTER QR */}
      {outerQr && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-900 tracking-wide">
              OUTER PACKAGE
            </span>

            {outerQr.tracking_id && (
              <span className="px-3 py-1 text-xs rounded-full bg-gray-800 text-white">
                {outerQr.tracking_id}
              </span>
            )}
          </div>

          <div className="flex gap-6">
            {/* QR */}
            <div className="text-center">
              <img
                src={`${outerQr.qr_image_url}?t=${Date.now()}`}
                className="w-40 h-40 border rounded bg-white"
              />

              <div className="flex justify-center gap-4 mt-3 text-sm">
                <a
                  href={outerQr.qr_image_url}
                  download
                  className="text-gray-600 hover:text-black underline underline-offset-2">
                  Download
                </a>
                <button
                  onClick={() => printQr(outerQr.qr_image_url)}
                  className="text-gray-600 hover:text-black underline underline-offset-2">
                  Print
                </button>
              </div>
            </div>

            {/* Payload */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-gray-600 hover:text-black underline underline-offset-2">
                  Encrypted Payload
                </p>
                <button
                  onClick={() => copyText(outerQr.encrypted_payload)}
                  className="text-gray-600 hover:text-black underline underline-offset-2">
                  Copy
                </button>
              </div>

              <div
                className="
  bg-gray-100
  border
  rounded
  p-2
  text-[11px]
  font-mono
  text-gray-800
  break-all
  max-h-40
  overflow-auto
">
                {outerQr.encrypted_payload}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INNER QRs */}
      {innerQrs && innerQrs.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-900 tracking-wide mb-3">
            INNER PACKAGES
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {innerQrs.map((qr, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-700">
                    Inner Package
                  </span>

                  {qr.tracking_id && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-700 text-white">
                      {qr.tracking_id}
                    </span>
                  )}
                </div>

                <div className="flex gap-4">
                  <img
                    src={qr.qr_image_url}
                    className="w-24 h-24 border rounded bg-white"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-medium text-gray-600">
                        Encrypted Payload
                      </p>
                      <button
                        onClick={() => copyText(qr.encrypted_payload)}
                        className="text-[10px] underline text-gray-500 hover:text-black">
                        Copy
                      </button>
                    </div>

                    <div
                      className="
  bg-gray-100
  border
  rounded
  p-2
  text-[11px]
  font-mono
  text-gray-800
  break-all
  max-h-30
  overflow-auto
">
                      {qr.encrypted_payload}
                    </div>

                    <div className="flex gap-3 mt-2 text-xs">
                      <a
                        href={qr.qr_image_url}
                        download
                        className="text-gray-600 hover:text-black underline underline-offset-2">
                        Download
                      </a>
                      <button
                        onClick={() => printQr(qr.qr_image_url)}
                        className="text-gray-600 hover:text-black underline underline-offset-2">
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
