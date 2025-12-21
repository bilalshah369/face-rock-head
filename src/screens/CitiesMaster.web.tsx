import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';

import {API_BASE} from '@env';
import {useNavigate, useSearchParams} from 'react-router-dom';

const TOKEN_KEY = 'nta_token';

type StateItem = {
  state_id: string;
  state_name: string;
};

type CityItem = {
  city_id: string;
  city_name: string;
  state_id: string;
};

export default function CitiesMaster() {
  const token = localStorage.getItem(TOKEN_KEY);
  const navigate = useNavigate();

  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [params] = useSearchParams();
  const stateIdFromUrl = params.get('state_id');

  const [selectedState, setSelectedState] = useState<string>(
    stateIdFromUrl || '',
  );

  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<CityItem | null>(null);

  const [form, setForm] = useState({
    state_id: '',
    city_name: '',
  });

  if (!token) {
    navigate('/Login');
    return null;
  }

  /* ================= FETCH STATES ================= */

  const fetchStates = async () => {
    const res = await fetch(`${API_BASE}/masters/states`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    const json = await res.json();
    if (json.success) setStates(json.data);
  };

  /* ================= FETCH CITIES ================= */

  const fetchCities = async (stateId?: string) => {
    //if (!stateId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/masters/cities?state_id=${stateId}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const json = await res.json();
      if (json.success) setCities(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedState) fetchCities(selectedState);
  }, [selectedState]);

  /* ================= CREATE / UPDATE ================= */

  const saveCity = async () => {
    const url = editingCity
      ? `${API_BASE}/masters/cities/${editingCity.city_id}`
      : `${API_BASE}/masters/cities`;

    const method = editingCity ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state_id: selectedState,
        city_name: form.city_name,
      }),
    });

    const json = await res.json();
    if (json.success) {
      setShowForm(false);
      setEditingCity(null);
      setForm({state_id: selectedState, city_name: ''});
      fetchCities(selectedState);
    }
  };

  /* ================= DELETE ================= */

  const deleteCity = async (cityId: string) => {
    if (!window.confirm('Delete this city?')) return;

    await fetch(`${API_BASE}/masters/cities/${cityId}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });

    fetchCities(selectedState);
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">City Master</h1>

        <button
          onClick={() => {
            setEditingCity(null);
            setForm({state_id: selectedState, city_name: ''});
            setShowForm(true);
          }}
          disabled={!selectedState}
          className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-900 disabled:opacity-50">
          + Add City
        </button>
      </div>

      {/* STATE FILTER */}
      <div className="bg-white p-3 rounded border mb-3 max-w-md">
        <label className="block text-xs font-medium mb-1">State</label>
        <select
          className="border rounded px-2 py-1.5 w-full text-sm"
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}>
          <option value="">Select State</option>
          {states.map(state => (
            <option key={state.state_id} value={state.state_id}>
              {state.state_name}
            </option>
          ))}
        </select>
      </div>

      {/* CITIES TABLE */}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">City Name</th>
              <th className="p-2 text-left">State Name</th>

              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map(city => (
              <tr key={city.city_id} className="border-t">
                <td className="p-2 font-medium">{city.city_name}</td>
                <td className="p-2 font-medium">
                  {states?.find(s => s.state_id === city.state_id)?.state_name}
                </td>

                <td className="p-2 space-x-3">
                  <button
                    onClick={() => {
                      setEditingCity(city);
                      setForm({
                        state_id: selectedState,
                        city_name: city.city_name,
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline">
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCity(city.city_id)}
                    className="text-red-600 hover:underline">
                    Delete
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/masters/centres?city_id=${city.city_id}`)
                    }
                    className="text-gray-700 hover:underline">
                    Exam Centers →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-3 text-sm text-gray-500">Loading...</p>}
        {!loading && cities.length === 0 && selectedState && (
          <p className="p-3 text-sm text-gray-500">No cities found.</p>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <Modal
          title={editingCity ? 'Edit City' : 'Create City'}
          onClose={() => setShowForm(false)}>
          <div className="mb-2">
            <label className="block text-xs font-medium mb-1">City Name</label>
            <input
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={form.city_name}
              onChange={e => setForm({...form, city_name: e.target.value})}
            />
          </div>

          <button
            onClick={saveCity}
            className="w-full bg-gray-800 text-white py-1.5 text-sm rounded mt-3">
            Save
          </button>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ================= MODAL ================= */

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
