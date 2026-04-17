import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'

function RegisterPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await registerUser(username, email, password)
            navigate('/login')
        } catch (err) {
            const detail = err.response?.data?.detail
            if (typeof detail === 'string') {
                setError(detail)
            } else if (Array.isArray(detail)) {
                setError(detail.map(d => d.msg).join(', '))
            } else {
                setError('Registration failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-2xl font-bold">
                        <span className="text-emerald-700">AI</span>
                        <span className="text-gray-900"> Lecturer</span>
                    </Link>
                    <p className="text-gray-400 text-sm mt-1">Join thousands of students learning with AI</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
                        Create your account
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-8">
                        Start learning with your personal AI lecturer
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
                            <span>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRegister(e)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="Create a password (min 6 characters)"
                        />
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={loading || !username || !email || !password}
                        className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 disabled:bg-gray-300 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Creating account...
                            </span>
                        ) : 'Create account'}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-700 font-semibold hover:text-emerald-800">
                                Sign in
                            </Link>
                        </p>
                        <Link to="/guest" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">
                            Or try as guest →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
