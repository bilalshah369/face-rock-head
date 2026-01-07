import React, {forwardRef, useEffect, useState} from 'react';

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

    const [qrImage, setQrImage] = useState<string>(qrImageUrl);
    const [qrPhotoImage, setQrPhotoImage] = useState<string | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      setQrImage(qrImageUrl);
    }, [qrImageUrl]);

    const generateQR = async () => {
      if (!refNo || !photo) {
        setError('Roll number and photo are required');
        return;
      }

      setError('');
      setLoading(true);

      const formData = new FormData();
      formData.append('rollNumber', refNo);
      formData.append('photo', photo);

      try {
        const response = await fetch(
          'http://localhost:31140/uidSecureQRCodeAPI/api/signature/generate-qrcode-with-photo',
          {
            method: 'POST',
            body: formData,
          },
        );

        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'QR generation failed');
          return;
        }

        // ✅ Main QR
        // setQrImage(`data:image/png;base64,${data.qrCodeDemo}`);

        // ✅ Photo QR
        if (data.qrCodeDemoPhoto) {
          setQrPhotoImage(`data:image/png;base64,${data.qrCodeDemoPhoto}`);
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:bg-transparent">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 print:shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b print:hidden">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-xl text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Printable Content */}
          <div ref={printRef} className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left – QR Section */}
              <div className="md:w-1/3 flex flex-col items-center gap-4">
                {/* QR Code */}
                {/* <div className="border rounded-lg p-4 bg-gray-50 w-48 h-48 flex items-center justify-center">
                  <img
                    src={qrImage}
                    alt="QR Code"
                    className="w-40 h-40 object-contain"
                  />
                </div> */}

                {/* QR Embedded Photo */}
                {qrPhotoImage && (
                  <div className="border rounded-lg p-4 bg-gray-50 w-80 h-80 flex items-center justify-center">
                    <img
                      src={qrPhotoImage}
                      alt="QR Embedded Photo"
                      className="w-80 h-80 object-contain"
                    />
                  </div>
                )}

                <div className="text-xs font-medium">{refNo}</div>

                {/* Photo Upload */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setPhoto(e.target.files?.[0] || null)}
                  className="text-xs print:hidden"
                />

                {/* Generate Button */}
                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="px-4 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 print:hidden">
                  {loading ? 'Generating...' : 'Generate QR'}
                </button>

                {/* Error */}
                {error && (
                  <div className="text-xs text-red-600 text-center">
                    {error}
                  </div>
                )}
              </div>

              {/* Right – Info */}
              <div className="md:w-2/3 space-y-3">
                {info.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b pb-2 text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
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

          {/* Footer */}
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
