import { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { loginUser } from '../services/api';

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await loginUser(username, password);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 w-96">
                <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                    Welcome back
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Sign in to continue your learning journey
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm text-gray-500 mb-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                        placeholder="Enter your username"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-emerald-700 font-semibold">
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
