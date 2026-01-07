import React, {useState} from 'react';

type LoginResponse = {
  success: boolean;
  token: string;
  user: {
    user_id: string;
    username: string;
    role_id: string;
  };
};
import {API_BASE} from '@env';
import {useNavigate} from 'react-router-dom';
export default function LoginWeb({navigation}: any) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('a');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
      });

      const data: LoginResponse = await res.json();

      if (!data.success) {
        throw new Error('Invalid credentials');
      }

      // Store token (web)
      localStorage.setItem('nta_token', data.token);
      localStorage.setItem('nta_user', JSON.stringify(data.user));

      // Redirect (replace later with router)

      navigate('/ApplicationList');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            NTA Face Recognition
          </h1>
          <p className="text-sm text-gray-500 mt-1">Secure Admin Login</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} National Testing Agency
          <br />
          Authorized Personnel Only
        </div>
      </div>
    </div>
  );
}
