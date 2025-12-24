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

type OuterPackageItem = {
  outer_package_id: string;
  tracking_id: string;
  centre_name: string;
  outer_tracking_id: string;
};

type QRResponse = {
  qr_image_url: string;
  encrypted_payload: string;
};

type InnerPackageProps = {
  onParentQr?: (qr: any) => void;
  onInnerQr?: (qr: any) => void;
  onInnerQrsLoaded?: (qrs: any[]) => void;
};

export default function InnerPackage({
  onParentQr,
  onInnerQr,
  onInnerQrsLoaded,
}: InnerPackageProps) {
  const [editMode, setEditMode] = useState(false);
  const token = localStorage.getItem(TOKEN_KEY);
  const storedTrackingId = localStorage.getItem('tracking_id');
  const [innerTrackingId, setInnerTrackingId] = useState('');
  const [encryptedPayload, setEncryptedPayload] = useState('');
  const [outerPackageId, setOuterPackageId] = useState('');
  const [centreId, setCentreId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [qrResultInner, setQrResultInner] = useState<QRResponse[]>([]);
  const [outerPackages, setOuterPackages] = useState<OuterPackageItem[]>([]);
  const [centres, setCentres] = useState<CentreItem[]>([]);
  const [qrResult, setQrResult] = useState<QRResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    fetchOuterPackages();
    fetchCentres();
  }, []);

  /* ---------------- HELPERS ---------------- */
  const generateTrackingId = () => {
    const now = new Date();
    return `IN-${now
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14)}`;
  };

  /* ---------------- API ---------------- */
  const fetchOuterPackages = async () => {
    const res = await fetch(`${API_BASE}/packages?page=1&limit=100`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setOuterPackages(json.data);
    debugger;
    if (storedTrackingId) {
      loadPackage(storedTrackingId);
      setEditMode(true);
      //   const OuterPackage = json.data.find(
      //     (p: OuterPackageItem) => p.outer_tracking_id === storedTrackingId,
      //   );
      //   if (OuterPackage) {
      //     setOuterPackageId(OuterPackage.outer_package_id);
      //     GetInnerQRResult(OuterPackage.tracking_id);
      //   }
    }
  };

  const fetchCentres = async () => {
    const res = await fetch(`${API_BASE}/masters/centres`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setCentres(json.data);
  };

  const generateQR = async (trackingId: string) => {
    const res = await fetch(`${API_BASE}/qrcode/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tracking_id: trackingId,
        qr_type: 'INNER',
      }),
    });

    const json = await res.json();
    if (json.success) {
      setQrResult(json.data);
      onInnerQr?.(json.data);
    }
  };
  const fetchParentOuterQr = async (trackingId: string) => {
    const res = await fetch(`${API_BASE}/qrcode/${trackingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (json.success) {
      onParentQr?.(json.data);
    }
  };
  const createInnerPackage = async () => {
    setError('');
    setSuccess('');

    if (
      !innerTrackingId ||
      !encryptedPayload ||
      !outerPackageId ||
      !centreId ||
      !examDate
    ) {
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

      const res = await fetch(`${API_BASE}/packages/inner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tracking_id: innerTrackingId,
          encrypted_qr_payload: encrypted,
          outer_package_id: Number(outerPackageId),
          centre_id: Number(centreId),
          exam_date: examDate,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setSuccess('Inner package saved successfully');
      generateQR(innerTrackingId);

      // reset for next entry
      //setInnerTrackingId('');
      // setEncryptedPayload('');
      //setExamDate('');
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
  const loadPackage = async (id: string) => {
    try {
      debugger;
      const res = await fetch(`${API_BASE}/packages/${id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();

      if (!json.success) throw new Error('Failed to load package');
      if (json.data.inner === null) {
      } else {
        const inner = json.data.inner;

        setInnerTrackingId(inner.tracking_id);
        setEncryptedPayload(decryptQR(inner.encrypted_qr_payload) || '');
        const toLocalDate = (utc: string) => {
          const d = new Date(utc);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            '0',
          )}-${String(d.getDate()).padStart(2, '0')}`;
        };
        setExamDate(toLocalDate(inner.exam_date));
        setCentreId(inner.centre_id);
        setOuterPackageId(inner.outer_package_id);

        //fetchOuterQR(inner.tracking_id);
        //GetInnerQRResult(inner.tracking_id);
        //generateQR(inner.tracking_id);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };
  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-md bg-white p-4 rounded-md border">
      <h2 className="text-base font-semibold mb-3">
        {editMode ? 'Edit Inner Package' : 'Create Inner Package'}
      </h2>
      <Input
        disabled={editMode}
        label="Inner Tracking ID"
        value={innerTrackingId}
        onChange={setInnerTrackingId}
      />
      {!editMode && (
        <button
          onClick={() => setInnerTrackingId(generateTrackingId())}
          className="text-blue-600 underline text-xs mt-1">
          + Generate InnerTracking ID
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

      <label className="block text-sm font-medium mt-4">Outer Package</label>
      <select
        disabled={editMode}
        value={outerPackageId}
        onChange={e => {
          setOuterPackageId(e.target.value);
          const selected = outerPackages.find(
            p => p.outer_package_id === e.target.value,
          );

          if (selected) {
            fetchParentOuterQr(selected.tracking_id);
            GetInnerQRResult(selected.tracking_id);
          }
        }}
        className="
    w-full
    border
    rounded
    px-2
    py-1.5
    text-sm
    disabled:bg-gray-100
    focus:outline-none
    focus:ring-1
    focus:ring-gray-400
  ">
        <option value="">Select Outer Package</option>
        {outerPackages.map(pkg => (
          <option key={pkg.outer_package_id} value={pkg.outer_package_id}>
            {pkg.tracking_id} — {pkg.centre_name}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium mt-4">
        Destination Exam Centre
      </label>
      <select
        value={centreId}
        onChange={e => setCentreId(e.target.value)}
        className="
    w-full
    border
    rounded
    px-2
    py-1.5
    text-sm
    disabled:bg-gray-100
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

      <Input
        label="Exam Date"
        type="date"
        value={examDate}
        onChange={setExamDate}
      />

      {error && <p className="text-red-600 mt-2 text-xs">{error}</p>}
      {success && <p className="text-green-600 mt-2 text-xs">{success}</p>}

      <button
        onClick={createInnerPackage}
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
  disabled:opacity-50
">
        {loading
          ? 'Saving...'
          : editMode
          ? 'Update Inner Package'
          : 'Create Inner Package'}
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
function Input({label, value, onChange, type = 'text', disabled = false}: any) {
  return (
    <div className="mt-2">
      <label className="block text-xs font-medium mb-1 text-gray-700">
        {label}
      </label>
      <input
        type={type}
        disabled={disabled}
        className="
          w-full
          border
          rounded
          px-2
          py-1.5
          text-sm
          disabled:bg-gray-100
          focus:outline-none
          focus:ring-1
          focus:ring-gray-400
        "
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
