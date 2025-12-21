import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';
import CryptoJS from 'crypto-js';
import {API_BASE} from '@env';
import {decryptQR} from '../utils/qrDecrypt';
const TOKEN_KEY = 'nta_token';
import {QR_IV, QR_SECRET} from '@env';

const QR_IV_Parse = CryptoJS.enc.Utf8.parse(QR_IV);
type PackageType = 'OUTER' | 'INNER';
type CentreItem = {
  centre_id: string;
  centre_code: string;
  centre_name: string;
  city_id: string;
  latitude: number;
  longitude: number;
};
type PackageItem = {
  id: number;
  tracking_id: string;
  status: string;
  qr_type?: string;
  created_on: string;
  outer_package_id?: string;
  destination_centre_id?: string;
  encrypted_qr_payload?: string;
  dispatch_datetime?: string;
  return_dispatch_datetime?: string;
  created_by?: string;
  updated_on?: string;
  updated_by?: string;
  centre_code?: string;
  centre_name?: string;
};
type QRResponse = {
  qr_image_url: string;
  encrypted_payload: string;
};
type PackageData = {
  outer: any;
  inner: any;
};
export default function CreatePackage({navigation}: any) {
  const [storedTrackingId, setStoredTrackingId] = useState(() =>
    localStorage.getItem('tracking_id'),
  );
  const [qrResult, setQrResult] = useState<QRResponse | null>(null);
  const [qrResultInner, setQrResultInner] = useState<QRResponse[]>([]);
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [packageType, setPackageType] = useState<PackageType>('OUTER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [centres, setCentres] = useState<CentreItem[]>([]);
  // Common
  const [trackingId, setTrackingId] = useState('');
  const [innerTrackingId, setInnerTrackingId] = useState('');
  const [encryptedPayload, setEncryptedPayload] = useState('');
  const [innerEncryptedPayload, setInnerEncryptedPayload] = useState('');

  // Outer
  const [destinationCentreId, setDestinationCentreId] = useState('');

  // Inner
  const [outerPackageId, setOuterPackageId] = useState('');
  const [centreId, setCentreId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const token = localStorage.getItem(TOKEN_KEY);
  useEffect(() => {
    debugger;
    if (!storedTrackingId) return;

    fetchPackage(storedTrackingId);
    generateQR(storedTrackingId);
    GetInnerQRResult(storedTrackingId);
    // 🔥 your logic here (API calls, enable UI, etc.)
  }, [storedTrackingId]);
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigation.navigate('Login');
  };

  const goTo = (path: string) => {
    navigation.navigate(path);
  };

  if (!token) {
    navigation.navigate('Login');
    return null;
  }

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };
  const fetchCentres = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/masters/centres`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();
      if (json.success) setCentres(json.data);
    } finally {
      setLoading(false);
    }
  };
  const createPackage = async () => {
    resetMessages();
    if (packageType === 'INNER') {
      if (!innerTrackingId || !innerEncryptedPayload) {
        setError('Inner Tracking ID and Encrypted Payload are required');
        return;
      }
    }
    debugger;
    if (packageType === 'OUTER') {
      if (!trackingId || !encryptedPayload) {
        setError('Tracking ID and Encrypted Payload are required');
        return;
      }
    }
    const encrypted = CryptoJS.AES.encrypt(
      packageType === 'OUTER' ? encryptedPayload : innerEncryptedPayload,
      CryptoJS.enc.Utf8.parse(QR_SECRET),
      {iv: QR_IV_Parse},
    ).toString();
    let url = '';
    let body: any = {
      tracking_id: packageType === 'OUTER' ? trackingId : innerTrackingId,
      encrypted_qr_payload: encrypted,
    };

    if (packageType === 'OUTER') {
      if (!destinationCentreId) {
        setError('Destination Centre is required');
        return;
      }
      url = `${API_BASE}/packages/outer`;
      body.destination_centre_id = Number(destinationCentreId);
    } else {
      if (!outerPackageId || !centreId || !examDate) {
        setError('All inner package fields are required');
        return;
      }

      url = `${API_BASE}/packages/inner`;
      body.outer_package_id = Number(outerPackageId);
      body.centre_id = Number(centreId);
      body.exam_date = examDate;
    }

    try {
      setLoading(true);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Creation failed');
      }

      setSuccess(`${packageType} package created successfully`);
      debugger;
      if (packageType === 'OUTER') {
        await fetchPackages();
        setPackageType('INNER');
        setOuterPackageId(json.data.outer_package_id);
        setCentreId(json.data.destination_centre_id.toString());
        setDestinationCentreId(json.data.destination_centre_id.toString());
        setTrackingId(json.data.tracking_id);
        setEncryptedPayload(decryptQR(json.data.encrypted_qr_payload) || '');
        await fetchPackage(json.data.tracking_id);

        generateQR(json.data.tracking_id);
        GetInnerQRResult(json.data.tracking_id);
        const input = document.getElementById(
          'InputtrackingId',
        ) as HTMLInputElement | null;

        if (input && input.value.trim()) {
          input.disabled = true;
        }
        (
          document.getElementById(
            'InputouterPackageId',
          ) as HTMLInputElement | null
        )?.setAttribute('disabled', 'true');
        (
          document.getElementById('InputcentreId') as HTMLInputElement | null
        )?.setAttribute('disabled', 'true');
      } else {
        //setPkg(null);
      }
      //setTrackingId('');
      //setTrackingId('');
      //setEncryptedPayload('');
      //setDestinationCentreId('');
      setInnerEncryptedPayload('');
      setInnerTrackingId('');
      setExamDate('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  function generatePackageTrackingId(type: PackageType): string {
    const prefix = type.toUpperCase(); // INNER / OUTER

    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${prefix}-${day}${month}${year}-${hours}${minutes}${seconds}`;
  }
  const fetchPackages = async () => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE}/packages?page=1&limit=100`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error('Failed to fetch packages');
      }

      setPackages(json.data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  const fetchPackage = async (pkg_track_id: string) => {
    try {
      const res = await fetch(`${API_BASE}/packages/${pkg_track_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!json.success) throw new Error('Failed to fetch package');

      setPkg(json.data);
      setTrackingId(json.data.outer.tracking_id);
      setEncryptedPayload(json.data.outer.encrypted_qr_payload);
      setDestinationCentreId(json.data.outer.destination_centre_id.toString());
    } catch (err: any) {
      setError(err.message);
    }
  };
  const generateQR = async (trackingId: string) => {
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

  const GetInnerQRResult = async (outer_package_id: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/packages/getInnerPackageByOuterPackageId/${outer_package_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();
      if (!json.success) throw new Error('Failed to fetch package');

      setQrResultInner(json.data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCentres();
    fetchPackages();
  }, []);
  return (
    <AdminLayout>
      <div className="flex justify-between mb-6 gap-4">
        <div>
          {/* <h1 className="text-2xl font-semibold mb-6">Create Package</h1> */}

          {/* Package Type Toggle */}
          <div className="flex gap-3 mb-6">
            {['OUTER', 'INNER'].map(type => (
              <button
                key={type}
                onClick={() => setPackageType(type as PackageType)}
                className={`px-4 py-2 rounded font-medium border ${
                  packageType === type
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}>
                {type} Package
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="max-w-xl space-y-4 bg-white p-6 rounded border">
            {packageType === 'OUTER' ? (
              <div className="">
                <Input
                  id="InputtrackingId"
                  label="Tracking ID"
                  value={trackingId}
                  onChange={setTrackingId}
                  placeholder={packageType === 'OUTER' ? 'OUT-5001' : 'IN-9001'}
                />

                <button
                  type="button"
                  onClick={() => {
                    const newId = generatePackageTrackingId(packageType);
                    setTrackingId(newId);
                  }}
                  className="
    inline-flex
    items-center
    gap-1
    text-blue-600
    font-medium
    hover:text-blue-700
    hover:underline
    transition
  ">
                  {' '}
                  <span className="text-lg leading-none">+</span>
                  Generate Tracking ID
                </button>
              </div>
            ) : (
              <div className="">
                <Input
                  label="Tracking ID"
                  value={innerTrackingId}
                  onChange={setInnerTrackingId}
                  placeholder={'IN-9001'}
                />

                <button
                  type="button"
                  onClick={() => {
                    const newId = generatePackageTrackingId(packageType);
                    if (packageType === 'INNER') {
                      setInnerTrackingId(newId);
                    } else {
                      setTrackingId(newId);
                    }
                  }}
                  className="
    inline-flex
    items-center
    gap-1
    text-blue-600
    font-medium
    hover:text-blue-700
    hover:underline
    transition
  ">
                  {' '}
                  <span className="text-lg leading-none">+</span>
                  Generate Inner-Tracking ID
                </button>
              </div>
            )}

            {packageType === 'OUTER' && (
              <>
                {/* <Input
              label="Destination Centre"
              value={destinationCentreId}
              onChange={setDestinationCentreId}
              type="number"
              placeholder="3"
            /> */}
                <Input
                  label="Encrypted QR Payload"
                  value={encryptedPayload}
                  onChange={setEncryptedPayload}
                  placeholder="ENCRYPTED_QR_xxxx"
                  multiline
                  numberOfLines={4}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Destination Exam Centre
                  </label>
                  <select
                    className="border rounded px-3 py-2"
                    value={destinationCentreId}
                    onChange={e => setDestinationCentreId(e.target.value)}>
                    <option value="">Select Destination Exam Centre</option>
                    {centres.map(centre => (
                      <option key={centre.centre_id} value={centre.centre_id}>
                        {centre.centre_code} — {centre.centre_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {packageType === 'INNER' && (
              <>
                {/* <Input
              label="Outer Package ID"
              value={outerPackageId}
              onChange={setOuterPackageId}
              type="number"
            /> */}
                <Input
                  label="Encrypted QR Payload"
                  value={innerEncryptedPayload}
                  onChange={setInnerEncryptedPayload}
                  placeholder="ENCRYPTED_QR_xxxx"
                  multiline
                  numberOfLines={4}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Outer Package
                  </label>
                  <select
                    id="InputouterPackageId"
                    className="border rounded px-3 py-2"
                    value={outerPackageId}
                    onChange={e => setOuterPackageId(e.target.value)}>
                    <option value="">Select Outer Package</option>
                    {packages.map(pack => (
                      <option
                        key={pack.outer_package_id}
                        value={pack.outer_package_id}>
                        {pack.tracking_id} — {pack.centre_name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <Input
              label="Centre ID"
              value={centreId}
              onChange={setCentreId}
              type="number"
            /> */}
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Destination Exam Centre
                  </label>
                  <select
                    id="InputcentreId"
                    className="border rounded px-3 py-2"
                    value={centreId}
                    onChange={e => setCentreId(e.target.value)}>
                    <option value="">Select Destination Exam Centre</option>
                    {centres.map(centre => (
                      <option key={centre.centre_id} value={centre.centre_id}>
                        {centre.centre_code} — {centre.centre_name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Exam Date"
                  value={examDate}
                  onChange={setExamDate}
                  type="date"
                />
              </>
            )}
          </div>

          {error && <p className="text-red-600 mt-4">{error}</p>}
          {success && <p className="text-green-600 mt-4">{success}</p>}

          <button
            onClick={createPackage}
            disabled={loading}
            className="mt-6 bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 disabled:opacity-50">
            {loading ? 'Creating...' : `Create ${packageType} Package`}
          </button>
        </div>
        {/* QR Result */}
        {qrResult && (
          <div className="bg-white rounded border p-6">
            <h2 className="text-lg font-semibold mb-4">Generated QR Code</h2>

            <div className="flex gap-6 items-start">
              <img
                src={qrResult?.qr_image_url?.replace('\\', '/')}
                alt="QR"
                className="w-48 h-48 border rounded"
              />

              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Encrypted Payload</p>
                <p className="text-xs break-all text-gray-700 bg-gray-50 p-3 rounded">
                  {qrResult?.encrypted_payload}
                </p>

                <a
                  href={qrResult?.qr_image_url?.replace('\\', '/')}
                  target="_blank"
                  className="inline-block mt-4 text-gray-800 underline text-sm">
                  Download QR Image
                </a>
              </div>
            </div>

            {/* GRID: minimum 2 per row */}
            <div className="grid grid-cols-2 gap-6">
              {qrResultInner?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-4 items-start border rounded p-4 bg-gray-50">
                  <img
                    src={item.qr_image_url?.replace('\\', '/')}
                    alt={`QR-${index}`}
                    className="w-40 h-40 border rounded"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">
                      Encrypted Payload
                    </p>
                    <p className="text-xs break-all text-gray-700 bg-white p-2 rounded">
                      {item.encrypted_payload}
                    </p>

                    <a
                      href={item.qr_image_url?.replace('\\', '/')}
                      target="_blank"
                      className="inline-block mt-3 text-gray-800 underline text-sm">
                      Download QR Image
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

/* Reusable Input Component */
function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',

  id,
}: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <input
        id={id ?? undefined}
        type={type}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
