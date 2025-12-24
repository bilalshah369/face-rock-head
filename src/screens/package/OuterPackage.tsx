import React, {useEffect, useState} from 'react';
import CryptoJS from 'crypto-js';
import {API_BASE, QR_IV, QR_SECRET} from '@env';
import {decryptQR} from '../../utils/qrDecrypt';

const TOKEN_KEY = 'nta_token';
const QR_IV_Parse = CryptoJS.enc.Utf8.parse(QR_IV);

type CentreItem = {
  centre_id: string;
  centre_code: string;
  centre_name: string;
};

type QRResponse = {
  qr_image_url: string;
  encrypted_payload: string;
};
type OuterPackageProps = {
  onQrGenerated?: (qr: any) => void;
  onInnerQrsLoaded?: (qrs: any[]) => void;
};

export default function OuterPackage({
  onQrGenerated,
  onInnerQrsLoaded,
}: OuterPackageProps) {
  const token = localStorage.getItem(TOKEN_KEY);
  const storedTrackingId = localStorage.getItem('tracking_id');
  const [qrResultInner, setQrResultInner] = useState<QRResponse[]>([]);
  const [trackingId, setTrackingId] = useState('');
  const [encryptedPayload, setEncryptedPayload] = useState('');
  const [destinationCentreId, setDestinationCentreId] = useState('');
  const [centres, setCentres] = useState<CentreItem[]>([]);
  const [qrResult, setQrResult] = useState<QRResponse | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    fetchCentres();

    if (storedTrackingId) {
      loadPackage(storedTrackingId);
      setEditMode(true);
    }
  }, []);

  /* ---------------- HELPERS ---------------- */
  const generateTrackingId = () => {
    const now = new Date();
    return `OUT-${now
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14)}`;
  };

  /* ---------------- API ---------------- */
  const fetchCentres = async () => {
    const res = await fetch(`${API_BASE}/masters/centres`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setCentres(json.data);
  };
  const fetchOuterQR = async (trackingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/qrcode/${trackingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!json.success) throw new Error('QR not found');

      setQrResult(json.data);
      onQrGenerated?.(json.data);
    } catch (err) {
      console.error(err);
    }
  };
  const loadPackage = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/packages/${id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();

      if (!json.success) throw new Error('Failed to load package');

      const outer = json.data.outer;

      setTrackingId(outer.tracking_id);
      setEncryptedPayload(decryptQR(outer.encrypted_qr_payload) || '');
      setDestinationCentreId(outer.destination_centre_id.toString());
      fetchOuterQR(outer.tracking_id);
      GetInnerQRResult(outer.tracking_id);
      //generateQR(outer.tracking_id);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const generateQR = async (id: string) => {
    const res = await fetch(`${API_BASE}/qrcode/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tracking_id: id,
        qr_type: 'OUTER',
      }),
    });

    const json = await res.json();
    if (json.success) setQrResult(json.data);
    onQrGenerated?.(json.data);
  };

  const saveOuterPackage = async () => {
    setError('');
    setSuccess('');

    if (!trackingId || !encryptedPayload || !destinationCentreId) {
      setError('All fields are required');
      return;
    }

    const encrypted = CryptoJS.AES.encrypt(
      encryptedPayload,
      CryptoJS.enc.Utf8.parse(QR_SECRET),
      {iv: QR_IV_Parse},
    ).toString();

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/packages/outer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tracking_id: trackingId,
          encrypted_qr_payload: encrypted,
          destination_centre_id: Number(destinationCentreId),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      localStorage.setItem('tracking_id', trackingId);
      setEditMode(true);
      setSuccess('Outer package saved successfully');

      generateQR(trackingId);
      GetInnerQRResult(trackingId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const GetInnerQRResult = async (outerTrackingId: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/packages/getInnerPackageByOuterPackageId/${outerTrackingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();
      if (!json.success) throw new Error('Failed to fetch inner QRs');

      setQrResultInner(json.data);

      // ✅ SEND TO RIGHT PANEL
      onInnerQrsLoaded?.(json.data);
    } catch (err: any) {
      console.error(err.message);
    }
  };
  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-md bg-white p-4 rounded-md border">
      <h2 className="text-base font-semibold mb-3">
        {editMode ? 'Edit Outer Package' : 'Create Outer Package'}
      </h2>

      <Input
        label="Tracking ID"
        value={trackingId}
        disabled={editMode}
        onChange={setTrackingId}
      />

      {!editMode && (
        <button
          onClick={() => setTrackingId(generateTrackingId())}
          className="text-blue-600 underline text-xs mt-1">
          + Generate Tracking ID
        </button>
      )}

      {/* <Input
        label="Encrypted QR Payload"
        value={encryptedPayload}
        onChange={setEncryptedPayload}
      /> */}
      <div className="mt-2">
        <label className="block text-xs font-medium mb-1 text-gray-700">
          {'Encrypted QR Payload'}
        </label>
        <textarea
          className="
          w-full
          border
          rounded
          px-2
          py-1.5
          text-sm
          focus:outline-none
          focus:ring-1
          focus:ring-gray-400
        "
          placeholder="Encrypted QR Payload"
          value={encryptedPayload}
          onChange={e => {
            setEncryptedPayload(e.target.value);
          }}
        />
      </div>

      <label className="block text-sm font-medium mt-4">
        Destination Exam Centre
      </label>
      <select
        value={destinationCentreId}
        disabled={editMode}
        onChange={e => setDestinationCentreId(e.target.value)}
        className="
    w-full
    border
    rounded
    px-2
    py-1.5
    text-sm
    focus:outline-none
    focus:ring-1
    focus:ring-gray-400
  ">
        <option value="">Select Centre</option>
        {centres.map(c => (
          <option key={c.centre_id} value={c.centre_id}>
            {c.centre_code} — {c.centre_name}
          </option>
        ))}
      </select>

      {error && <p className="text-red-600 mt-2 text-xs">{error}</p>}
      {success && <p className="text-green-600 mt-2 text-xs">{success}</p>}

      <button
        onClick={saveOuterPackage}
        disabled={loading}
        className="
  mt-4
  bg-gray-800
  text-white
  px-4
  py-1.5
  text-sm
  rounded
  hover:bg-gray-900
">
        {loading ? 'Saving...' : editMode ? 'Update Package' : 'Create Package'}
      </button>

      {/* {qrResult && (
        <div className="mt-6 border-t pt-4">
          <img src={qrResult.qr_image_url} className="w-48 h-48 border" />
          <a
            href={qrResult.qr_image_url}
            target="_blank"
            className="block mt-2 underline text-sm">
            Download QR
          </a>
        </div>
      )} */}
    </div>
  );
}

/* ---------------- Input ---------------- */
function Input({label, value, onChange, disabled = false}: any) {
  return (
    <div className="mt-2">
      <label className="block text-xs font-medium mb-1 text-gray-700">
        {label}
      </label>
      <input
        className="
          w-full
          border
          rounded
          px-2
          py-1.5
          text-sm
          focus:outline-none
          focus:ring-1
          focus:ring-gray-400
        "
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
