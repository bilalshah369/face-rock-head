import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';

import {API_BASE} from '@env';
import {useSearchParams} from 'react-router-dom';
const TOKEN_KEY = 'nta_token';

type CityItem = {
  city_id: string;
  city_name: string;
};

type CentreItem = {
  centre_id: string;
  centre_code: string;
  centre_name: string;
  city_id: string;
  latitude: number;
  longitude: number;
};

export default function CentresMaster({navigation}: any) {
  const token = localStorage.getItem(TOKEN_KEY);
  const [params] = useSearchParams();
  const cityIdFromUrl = params.get('city_id');
  const [cities, setCities] = useState<CityItem[]>([]);
  const [centres, setCentres] = useState<CentreItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState<string>(cityIdFromUrl || '');
  const [showForm, setShowForm] = useState(false);
  const [editingCentre, setEditingCentre] = useState<CentreItem | null>(null);

  const [form, setForm] = useState({
    centre_code: '',
    centre_name: '',
    city_id: '',
    latitude: '',
    longitude: '',
  });

  if (!token) {
    navigation.navigate('Login');
    return null;
  }

  /* ================= FETCH CITIES ================= */

  const fetchCities = async () => {
    const res = await fetch(`${API_BASE}/masters/cities`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setCities(json.data);
  };

  /* ================= FETCH CENTRES ================= */

  const fetchCentres = async (cityId?: string) => {
    //if (!cityId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/masters/centres?city_id=${cityId}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();
      if (json.success) setCentres(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchCentres();
  }, []);

  useEffect(() => {
    if (selectedCity) fetchCentres(selectedCity);
  }, [selectedCity]);

  /* ================= CREATE / UPDATE ================= */

  const saveCentre = async () => {
    const url = editingCentre
      ? `${API_BASE}/masters/centres/${editingCentre.centre_id}`
      : `${API_BASE}/masters/centres`;

    const method = editingCentre ? 'PUT' : 'POST';

    const payload = {
      centre_code: form.centre_code,
      centre_name: form.centre_name,
      city_id: Number(selectedCity),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      setShowForm(false);
      setEditingCentre(null);
      setForm({
        centre_code: '',
        centre_name: '',
        city_id: '',
        latitude: '',
        longitude: '',
      });
      fetchCentres(selectedCity);
    }
  };

  /* ================= DELETE ================= */

  const deleteCentre = async (centreId: string) => {
    if (!window.confirm('Delete this centre?')) return;

    await fetch(`${API_BASE}/masters/centres/${centreId}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });

    fetchCentres(selectedCity);
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Exam Centre Master</h1>

        <button
          onClick={() => {
            setEditingCentre(null);
            setForm({
              centre_code: '',
              centre_name: '',
              city_id: selectedCity,
              latitude: '',
              longitude: '',
            });
            setShowForm(true);
          }}
          disabled={!selectedCity}
          className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-900 disabled:opacity-50">
          + Add New Exam Centre
        </button>
      </div>

      {/* CITY FILTER */}
      <div className="bg-white p-3 rounded border mb-3 max-w-md">
        <label className="block text-xs font-medium mb-1">City</label>
        <select
          className="border rounded px-2 py-1.5 w-full text-sm"
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}>
          <option value="">Select City</option>
          {cities.map(city => (
            <option key={city.city_id} value={city.city_id}>
              {city.city_name}
            </option>
          ))}
        </select>
      </div>

      {/* CENTRES TABLE */}
      <div className="bg-white rounded border overflow-x-auto max-w-5xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Centre Code</th>
              <th className="p-2 text-left">Centre Name</th>
              <th className="p-2 text-left">City Name</th>
              <th className="p-2 text-left">Latitude</th>
              <th className="p-2 text-left">Longitude</th>
              <th className="p-2 text-left w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {centres.map(centre => (
              <tr key={centre.centre_id} className="border-t">
                <td className="p-2 font-medium">{centre.centre_code}</td>
                <td className="p-2">{centre.centre_name}</td>
                <td className="p-2">
                  {cities?.find(c => c.city_id === centre.city_id)?.city_name}
                </td>
                <td className="p-2">{centre.latitude}</td>
                <td className="p-2">{centre.longitude}</td>
                <td className="p-2 space-x-3">
                  <button
                    onClick={() => {
                      setEditingCentre(centre);
                      setForm({
                        centre_code: centre.centre_code,
                        centre_name: centre.centre_name,
                        city_id: selectedCity,
                        latitude: String(centre.latitude),
                        longitude: String(centre.longitude),
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline">
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCentre(centre.centre_id)}
                    className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-3 text-sm text-gray-500">Loading...</p>}
        {!loading && centres.length === 0 && selectedCity && (
          <p className="p-3 text-sm text-gray-500">No centres found.</p>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <Modal
          title={editingCentre ? 'Edit Centre' : 'Create Centre'}
          onClose={() => setShowForm(false)}>
          <Input
            label="Centre Code"
            value={form.centre_code}
            onChange={v => setForm({...form, centre_code: v})}
          />
          <Input
            label="Centre Name"
            value={form.centre_name}
            onChange={v => setForm({...form, centre_name: v})}
          />
          <Input
            label="Latitude"
            value={form.latitude}
            onChange={v => setForm({...form, latitude: v})}
          />
          <Input
            label="Longitude"
            value={form.longitude}
            onChange={v => setForm({...form, longitude: v})}
          />

          <button
            onClick={saveCentre}
            className="w-full bg-gray-800 text-white py-1.5 text-sm rounded mt-3">
            Save
          </button>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ================= REUSABLE UI ================= */

const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="mb-2">
    <label className="block text-xs font-medium mb-1">{label}</label>
    <input
      className="w-full border rounded px-2 py-1.5 text-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const Modal = ({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded p-4 w-full max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-500">
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);
