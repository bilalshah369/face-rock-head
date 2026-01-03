import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';
import {API_BASE} from '@env';

const TOKEN_KEY = 'nta_token';
const TRACKING_KEY = 'tracking_id';

type PackageData = {
  outer: any;
  inner: any;
};

type QRResponse = {
  qr_image_url: string;
  encrypted_payload: string;
};

export default function GenerateQR({navigation}: any) {
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [qrResult, setQrResult] = useState<QRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem(TOKEN_KEY);
  const trackingId = localStorage.getItem(TRACKING_KEY);

  if (!token) {
    navigation.navigate('Login');
    return null;
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigation.navigate('Login');
  };

  const goTo = (path: string) => {
    navigation.navigate(path);
  };

  /** Fetch package details */
  useEffect(() => {
    if (!trackingId) return;

    const fetchPackage = async () => {
      try {
        const res = await fetch(`${API_BASE}/packages/${trackingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (!json.success) throw new Error('Failed to fetch package');

        setPkg(json.data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchPackage();
  }, [trackingId]);

  /** Generate QR */
  const generateQR = async () => {
    setLoading(true);
    setError('');
    setQrResult(null);

    try {
      const res = await fetch(`${API_BASE}/qrcode/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tracking_id: trackingId,
          qr_type: 'OUTER',
          payload: {
            centre_code: pkg?.outer?.destination_centre_id,
          },
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error('QR generation failed');

      setQrResult(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* <h1 className="text-2xl font-semibold mb-6">Package QR Management</h1> */}
      <div className="flex gap-4">
        {/* Package Details */}
        {pkg?.outer && (
          <div className="bg-white rounded border p-6 max-w-3xl mb-8">
            <h2 className="text-lg font-semibold mb-4">Package Details</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Tracking ID" value={pkg.outer.tracking_id} />
              <Detail label="Status" value={pkg.outer.status} />
              <Detail
                label="Destination Centre"
                value={pkg.outer.destination_centre_id}
              />
              <Detail
                label="Created On"
                value={new Date(pkg.outer.created_on).toLocaleString()}
              />
              <Detail label="Created By" value={pkg.outer.created_by} />
            </div>

            {pkg.outer.status === 'CREATED' && (
              <button
                onClick={generateQR}
                disabled={loading}
                className="mt-6 px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50">
                {loading ? 'Generating QR...' : 'Generate QR Code'}
              </button>
            )}
          </div>
        )}

        {/* QR Result */}
        {qrResult && (
          <div className="bg-white rounded border p-6 max-w-3xl">
            <h2 className="text-lg font-semibold mb-4">Generated QR Code</h2>

            <div className="flex gap-6 items-start">
              <img
                src={qrResult.qr_image_url.replace('\\', '/')}
                alt="QR"
                className="w-48 h-48 border rounded"
              />

              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Encrypted Payload</p>
                <p className="text-xs break-all text-gray-700 bg-gray-50 p-3 rounded">
                  {qrResult.encrypted_payload}
                </p>

                <a
                  href={qrResult.qr_image_url.replace('\\', '/')}
                  target="_blank"
                  className="inline-block mt-4 text-gray-800 underline text-sm">
                  Download QR Image
                </a>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 mt-6">{error}</p>}
      </div>
    </AdminLayout>
  );
}

/** Reusable Detail Row */
const Detail = ({label, value}: {label: string; value: any}) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-medium">{value ?? '-'}</p>
  </div>
);
