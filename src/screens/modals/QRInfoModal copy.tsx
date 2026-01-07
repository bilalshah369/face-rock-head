import React, {forwardRef} from 'react';

interface QRInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrImageUrl: string;
  title?: string;
  info: {
    label: string;
    value: string;
  }[];
  description?: string;
}

const QRInfoModal = forwardRef<HTMLDivElement, QRInfoModalProps>(
  (
    {isOpen, onClose, qrImageUrl, title = 'QR Code Details', info, description},
    printRef,
  ) => {
    if (!isOpen) return null;

    const refNo = info.find(i => i.label === 'Application Ref No')?.value ?? '';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:bg-transparent">
        {/* Modal */}
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 print:shadow-none">
          {/* Header (❌ hide in print) */}
          <div className="flex items-center justify-between px-6 py-4 border-b print:hidden">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl">
              ✕
            </button>
          </div>

          {/* ✅ Printable Content */}
          <div ref={printRef} className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left - QR */}
              <div className="flex justify-center md:w-1/3">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center border rounded-lg p-4 bg-gray-50 w-48 h-48">
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>

                  {/* Ref No */}
                  <div className="mt-2 text-xs font-medium text-gray-800 text-center">
                    {refNo}
                  </div>

                  {/* Student Name */}
                  <div className="text-[11px] text-gray-500 text-center">
                    {title}
                  </div>
                </div>
              </div>

              {/* Right - Info */}
              <div className="md:w-2/3 space-y-3">
                {info.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b pb-2 text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">
                  Description
                </h3>
                <p className="text-sm text-gray-600 break-words">
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* Footer (❌ hide in print) */}
          <div className="flex justify-end px-6 py-4 border-t print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default QRInfoModal;
