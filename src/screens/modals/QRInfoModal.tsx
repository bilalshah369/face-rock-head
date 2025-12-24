import React from 'react';

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

export default function QRInfoModal({
  isOpen,
  onClose,
  qrImageUrl,
  title = 'QR Code Details',
  info,
  description,
}: QRInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left - QR Code */}
            <div className="flex justify-center md:w-1/3">
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-40 h-40 object-contain"
                />
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

          {/* Bottom - Description */}
          {description && (
            <div className="mt-6 border-t pt-4 w-full">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                Description
              </h3>

              <p className="text-sm text-gray-600 whitespace-pre-line break-words">
                {description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
