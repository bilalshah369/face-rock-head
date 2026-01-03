import React, {useEffect, useState} from 'react';
import AdminLayout from './AdminLayout';

import {API_BASE} from '@env';
const TOKEN_KEY = 'nta_token';
type Role = {
  role_id: string;
  role_name: string;
};

type User = {
  user_id: string;
  username: string;
  full_name: string;
  phone_number: string;
  role_id: string;
  role_name: string;
  centre_id: string | null;
  is_active: boolean;
};

export default function UserManagement({navigation}: any) {
  const token = localStorage.getItem(TOKEN_KEY);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    phone_number: '',
    role_id: '',
    centre_id: null as string | null,
  });

  if (!token) {
    navigation.navigate('Login');
    return null;
  }
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/masters/roles`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();
      if (json.success) setRoles(json.data);
    } catch {}
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigation.navigate('Login');
  };

  const goTo = (path: string) => navigation.navigate(path);

  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  /* ================= CREATE USER ================= */

  const createUser = async () => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (json.success) {
      setShowForm(false);
      fetchUsers();
    }
  };

  /* ================= DEACTIVATE ================= */

  const deactivateUser = async (userId: string) => {
    await fetch(`${API_BASE}/users/${userId}/deactivate`, {
      method: 'PUT',
      headers: {Authorization: `Bearer ${token}`},
    });
    fetchUsers();
  };

  /* ================= RESET PASSWORD ================= */

  const resetPassword = async () => {
    if (!selectedUser) return;

    await fetch(`${API_BASE}/users/${selectedUser.user_id}/reset-password`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({password: newPassword}),
    });

    setShowReset(false);
    setNewPassword('');
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
          + Add New User
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id} className="border-t">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.phone_number}</td>
                <td className="p-3">{u.role_name}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setShowReset(true);
                    }}
                    className="text-blue-600 hover:underline">
                    Reset
                  </button>

                  {u.is_active && (
                    <button
                      onClick={() => deactivateUser(u.user_id)}
                      className="text-red-600 hover:underline">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-4">Loading...</p>}
      </div>

      {/* CREATE USER MODAL */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} title="Create User">
          <Input
            label="Username"
            onChange={v => setForm({...form, username: v})}
          />
          <Input
            label="Password"
            type="password"
            onChange={v => setForm({...form, password: v})}
          />
          <Input
            label="Full Name"
            onChange={v => setForm({...form, full_name: v})}
          />
          <Input
            label="Phone"
            onChange={v => setForm({...form, phone_number: v})}
          />
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.role_id}
              onChange={e => setForm({...form, role_id: e.target.value})}>
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={createUser}
            className="w-full bg-gray-800 text-white py-2 rounded mt-4">
            Save
          </button>
        </Modal>
      )}

      {/* RESET PASSWORD MODAL */}
      {showReset && (
        <Modal onClose={() => setShowReset(false)} title="Reset Password">
          <Input
            label="New Password"
            type="password"
            onChange={v => setNewPassword(v)}
          />

          <button
            onClick={resetPassword}
            className="w-full bg-gray-800 text-white py-2 rounded mt-4">
            Reset Password
          </button>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Input = ({
  label,
  type = 'text',
  onChange,
}: {
  label: string;
  type?: string;
  onChange: (v: string) => void;
}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      className="w-full border rounded px-3 py-2"
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const Modal = ({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
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
