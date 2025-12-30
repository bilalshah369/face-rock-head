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

  type RouteCoordinate = {
    latitude: string;
    longitude: string;
  };

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeCentre, setRouteCentre] = useState<CentreItem | null>(null);
  const [coordinates, setCoordinates] = useState<RouteCoordinate[]>([
    {latitude: '', longitude: ''},
  ]);

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
          className="border rounded px-2 py-1.5 text-xs w-full"
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
      <div className="bg-white rounded border overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-xs">
            <tr>
              <th className="p-2 text-left">Centre Code</th>
              <th className="p-2 text-left">Centre Name</th>
              <th className="p-2 text-left">City Name</th>
              <th className="p-2 text-left">Latitude</th>
              <th className="p-2 text-left">Longitude</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {centres.map(centre => (
              <tr
                key={centre.centre_id}
                className="hover:bg-gray-200 transition">
                <td className="px-2 py-1 text-xs border">
                  {centre.centre_code}
                </td>
                <td className="px-2 py-1 text-xs border">
                  {centre.centre_name}
                </td>
                <td className="px-2 py-1 text-xs border">
                  {cities?.find(c => c.city_id === centre.city_id)?.city_name}
                </td>
                <td className="px-2 py-1 text-xs border">{centre.latitude}</td>
                <td className="px-2 py-1 text-xs border">{centre.longitude}</td>
                <td className="px-2 py-1 text-xs border">
                  <div className="flex gap-2 flex-wrap">
                    <CentreActionButton
                      label="Edit"
                      icon={<EditIcon />}
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
                    />

                    <CentreActionButton
                      label="Assign Route"
                      icon={<RouteIcon />}
                      variant="success"
                      onClick={async () => {
                        setRouteCentre(centre);
                        setShowRouteModal(true);

                        // Load existing route
                        const res = await fetch(
                          `${API_BASE}/masters/centres/centre-package-route/${centre.centre_id}`,
                          {
                            headers: {Authorization: `Bearer ${token}`},
                          },
                        );

                        const json = await res.json();

                        if (json.success && json.data.length > 0) {
                          setCoordinates(
                            json.data.map((p: any) => ({
                              latitude: String(p.latitude),
                              longitude: String(p.longitude),
                            })),
                          );
                        } else {
                          // No route exists → fresh
                          setCoordinates([{latitude: '', longitude: ''}]);
                        }
                      }}
                    />

                    <CentreActionButton
                      label="Delete"
                      icon={<DeleteIcon />}
                      variant="danger"
                      onClick={() => deleteCentre(centre.centre_id)}
                    />
                  </div>
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
      {showRouteModal && routeCentre && (
        <Modal
          title="Package Route Coordinates"
          onClose={() => setShowRouteModal(false)}>
          {/* Header Info */}
          <div className="mb-3">
            <p className="text-xs text-gray-500">
              Define the route points for centre:
              <span className="font-medium text-gray-700 ml-1">
                {routeCentre.centre_name}
              </span>
            </p>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 text-[11px] font-medium text-gray-600 border-b pb-1 mb-2">
            <div>#</div>
            <div>Latitude</div>
            <div>Longitude</div>
            <div />
          </div>

          {/* Coordinate Rows */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {coordinates.map((coord, index) => (
              <div
                key={index}
                className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
                <div className="text-xs text-gray-500">{index + 1}</div>

                <input
                  placeholder="Latitude"
                  className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={coord.latitude}
                  onChange={e => {
                    const updated = [...coordinates];
                    updated[index].latitude = e.target.value;
                    setCoordinates(updated);
                  }}
                />

                <input
                  placeholder="Longitude"
                  className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={coord.longitude}
                  onChange={e => {
                    const updated = [...coordinates];
                    updated[index].longitude = e.target.value;
                    setCoordinates(updated);
                  }}
                />

                {coordinates.length > 1 ? (
                  <button
                    onClick={() =>
                      setCoordinates(coordinates.filter((_, i) => i !== index))
                    }
                    className="text-red-500 hover:text-red-700 text-xs"
                    title="Remove">
                    ✕
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>

          {/* Add Row */}
          <button
            onClick={() =>
              setCoordinates([...coordinates, {latitude: '', longitude: ''}])
            }
            className="mt-2 text-xs text-blue-600 hover:underline">
            + Add another coordinate
          </button>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-4 border-t pt-3">
            <button
              onClick={() => setShowRouteModal(false)}
              className="px-3 py-1 text-xs border rounded text-gray-600 hover:bg-gray-100">
              Cancel
            </button>

            <button
              onClick={async () => {
                await fetch(
                  `${API_BASE}/masters/centres/centre-package-route`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      centre_id: routeCentre.centre_id,
                      route_points: coordinates.map(c => ({
                        latitude: Number(c.latitude),
                        longitude: Number(c.longitude),
                      })),
                    }),
                  },
                );

                setShowRouteModal(false);
              }}
              className="px-4 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-900">
              Save Route
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
const EditIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1 1-8 8H4v-1l8-8z" />
  </svg>
);

const RouteIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h10M3 10h10" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h10M5 6v8M9 6v8" />
  </svg>
);
type CentreActionButtonProps = {
  label: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'neutral';
  onClick?: () => void;
  disabled?: boolean;
};

const CentreActionButton = ({
  label,
  icon,
  variant = 'primary',
  onClick,
  disabled,
}: CentreActionButtonProps) => {
  const styles = {
    primary: 'border-blue-500 text-blue-600 hover:bg-blue-50',
    success: 'border-green-500 text-green-600 hover:bg-green-50',
    danger: 'border-red-500 text-red-600 hover:bg-red-50',
    neutral: 'border-gray-400 text-gray-500',
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        flex items-center gap-1 px-2 py-1 text-xs rounded border transition
        ${styles[variant]}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}>
      {icon}
      {label}
    </button>
  );
};

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
    <div className="bg-white rounded p-4 w-full max-w-3xl">
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
