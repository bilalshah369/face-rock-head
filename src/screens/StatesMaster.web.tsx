import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';
import {API_BASE} from '@env';
import {useNavigate} from 'react-router-dom';

const TOKEN_KEY = 'nta_token';

type StateItem = {
  state_id: string;
  state_name: string;
  state_code: string;
};

export default function StatesMaster({navigation}: any) {
  const token = localStorage.getItem(TOKEN_KEY);
  const navigate = useNavigate();
  const [states, setStates] = useState<StateItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingState, setEditingState] = useState<StateItem | null>(null);

  const [form, setForm] = useState({
    state_name: '',
    state_code: '',
  });

  if (!token) {
    navigate('/Login');
    return null;
  }

  /* ================= FETCH STATES ================= */

  const fetchStates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/masters/states`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();
      if (json.success) setStates(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  /* ================= CREATE / UPDATE ================= */

  const saveState = async () => {
    const url = editingState
      ? `${API_BASE}/masters/states/${editingState.state_id}`
      : `${API_BASE}/masters/states`;

    const method = editingState ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (json.success) {
      setShowForm(false);
      setEditingState(null);
      setForm({state_name: '', state_code: ''});
      fetchStates();
    }
  };

  /* ================= DELETE ================= */

  const deleteState = async (stateId: string) => {
    if (!window.confirm('Delete this state?')) return;

    await fetch(`${API_BASE}/masters/states/${stateId}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    });

    fetchStates();
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">States Master</h1>

        <button
          onClick={() => {
            setEditingState(null);
            setForm({state_name: '', state_code: ''});
            setShowForm(true);
          }}
          className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-900">
          + Add State
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">State Name</th>
              <th className="p-2 text-left">State Code</th>
              <th className="p-2 text-left w-56">Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map(state => (
              <tr key={state.state_id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{state.state_name}</td>
                <td className="p-2">{state.state_code}</td>
                <td className="p-2 space-x-3 text-sm">
                  <button
                    onClick={() => {
                      setEditingState(state);
                      setForm({
                        state_name: state.state_name,
                        state_code: state.state_code,
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline">
                    Edit
                  </button>

                  <button
                    onClick={() => deleteState(state.state_id)}
                    className="text-red-600 hover:underline">
                    Delete
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/masters/cities?state_id=${state.state_id}`)
                    }
                    className="text-gray-700 hover:underline">
                    Cities →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-3 text-sm text-gray-500">Loading...</p>}
      </div>

      {/* MODAL */}
      {showForm && (
        <Modal
          title={editingState ? 'Edit State' : 'Create State'}
          onClose={() => setShowForm(false)}>
          <Input
            label="State Name"
            value={form.state_name}
            onChange={v => setForm({...form, state_name: v})}
          />
          <Input
            label="State Code"
            value={form.state_code}
            onChange={v => setForm({...form, state_code: v})}
          />

          <button
            onClick={saveState}
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
