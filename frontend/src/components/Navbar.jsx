import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const drawerRef = useRef(null)

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        } else {
            setUser(null)
        }
    }, [location])

    // Close drawer when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                setDrawerOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
        setDrawerOpen(false)
        navigate('/')
    }

    const getProfileColor = () => {
        const saved = localStorage.getItem('profileColor')
        return saved || 'emerald'
    }

    const colorClasses = {
        emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
        blue: 'bg-blue-100 text-blue-700 ring-blue-300',
        purple: 'bg-purple-100 text-purple-700 ring-purple-300',
        amber: 'bg-amber-100 text-amber-700 ring-amber-300',
        rose: 'bg-rose-100 text-rose-700 ring-rose-300',
        cyan: 'bg-cyan-100 text-cyan-700 ring-cyan-300'
    }

    const setProfileColor = (color) => {
        localStorage.setItem('profileColor', color)
    }

    const profileColor = getProfileColor()

    return (
        <>
            <nav className="bg-white border-b border-gray-200 px-7 py-3.5 flex justify-between items-center relative z-50">
                <Link to="/" className="text-lg font-semibold">
                    <span className="text-emerald-700">AI</span>
                    <span className="text-gray-900"> Lecturer</span>
                </Link>

                <div className="flex items-center gap-3 md:gap-5">
                    <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
                        Home
                    </Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block">
                                Dashboard
                            </Link>
                            <Link to="/generate" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block">
                                Generate
                            </Link>
                            <button
                                onClick={() => setDrawerOpen(true)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer ring-2 ring-offset-1 hover:scale-105 transition-transform ${colorClasses[profileColor]}`}
                            >
                                {user.username.charAt(0).toUpperCase()}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/guest" className="text-sm text-gray-500 hover:text-gray-900">
                                Try as guest
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm bg-emerald-700 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-800"
                            >
                                Get started
                            </Link>
                            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900">
                                Sign in
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Dark overlay */}
            {drawerOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={() => setDrawerOpen(false)} />
            )}

            {/* Profile Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
                    drawerOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {user && (
                    <div className="h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="bg-emerald-700 p-6 text-white">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-3 ring-4 ring-white/30 ${colorClasses[profileColor]}`}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-lg font-bold">{user.username}</h2>
                            <p className="text-emerald-200 text-sm">{user.email || 'Student'}</p>
                        </div>

                        {/* Avatar Color Picker */}
                        <div className="p-6 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Avatar Color</p>
                            <div className="flex gap-2">
                                {Object.keys(colorClasses).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            setProfileColor(color)
                                            setDrawerOpen(false)
                                            setTimeout(() => setDrawerOpen(true), 100)
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 ${
                                            profileColor === color ? 'border-gray-900 scale-110' : 'border-gray-200'
                                        } transition-all`}
                                    >
                                        <div className={`w-full h-full rounded-full ${colorClasses[color].split(' ')[0]}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 p-4">
                            <Link
                                to="/dashboard"
                                onClick={() => setDrawerOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg">📊</span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Dashboard</p>
                                    <p className="text-xs text-gray-400">View your lectures and stats</p>
                                </div>
                            </Link>
                            <Link
                                to="/generate"
                                onClick={() => setDrawerOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg">🎓</span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Generate Lecture</p>
                                    <p className="text-xs text-gray-400">Create a new AI lecture</p>
                                </div>
                            </Link>
                            <Link
                                to="/"
                                onClick={() => setDrawerOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg">🏠</span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Home</p>
                                    <p className="text-xs text-gray-400">Back to homepage</p>
                                </div>
                            </Link>
                        </div>

                        {/* Logout Button */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Navbar


    