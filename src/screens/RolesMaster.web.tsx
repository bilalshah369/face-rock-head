import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';

import {API_BASE} from '@env';
const TOKEN_KEY = 'nta_token';

type Role = {
  role_id: string;
  role_name: string;
  description: string;
};

export default function RolesMaster({navigation}: any) {
  const token = localStorage.getItem(TOKEN_KEY);

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [form, setForm] = useState({
    role_name: '',
    description: '',
  });

  if (!token) {
    navigation.navigate('Login');
    return null;
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigation.navigate('Login');
  };

  const goTo = (path: string) => navigation.navigate(path);

  /* ================= FETCH ROLES ================= */

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/masters/roles`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();
      if (json.success) setRoles(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  /* ================= CREATE / UPDATE ================= */

  const saveRole = async () => {
    const url = editingRole
      ? `${API_BASE}/masters/roles/${editingRole.role_id}`
      : `${API_BASE}/masters/roles`;

    const method = editingRole ? 'PUT' : 'POST';

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
      setEditingRole(null);
      setForm({role_name: '', description: ''});
      fetchRoles();
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Roles Master</h1>

        <button
          onClick={() => {
            setEditingRole(null);
            setForm({role_name: '', description: ''});
            setShowForm(true);
          }}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
          + Add Role
        </button>
      </div>

      {/* ROLES TABLE */}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Role Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.role_id} className="border-t">
                <td className="p-3 font-medium">{role.role_name}</td>
                <td className="p-3">{role.description}</td>
                <td className="p-3 space-x-3">
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setForm({
                        role_name: role.role_name,
                        description: role.description,
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-4">Loading...</p>}
      </div>

      {/* CREATE / EDIT ROLE MODAL */}
      {showForm && (
        <Modal
          title={editingRole ? 'Edit Role' : 'Create Role'}
          onClose={() => setShowForm(false)}>
          <Input
            label="Role Name"
            value={form.role_name}
            onChange={v => setForm({...form, role_name: v})}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={v => setForm({...form, description: v})}
          />

          <button
            onClick={saveRole}
            className="w-full bg-gray-800 text-white py-2 rounded mt-4">
            Save
          </button>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ---------------- REUSABLE UI ---------------- */

const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      className="w-full border rounded px-3 py-2"
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
    <div className="bg-white rounded p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-500">
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);
