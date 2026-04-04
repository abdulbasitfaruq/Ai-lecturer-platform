import {Link, useNavigate} from 'react-router-dom';
import { useState , useEffect } from 'react';

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
              const parsed = (JSON.parse(savedUser));
              if (parsed) {
                setUser(parsed);
              }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    }

    return (
        <nav className="bg-white border-b border-gray-200 px-7 py-3.5 flex justify-between items-center">
            <Link to="/" className="text-lg font-semibold">
                <span className="text-emerald-700">AI</span>
                <span className="text-gray-900"> Lecturer</span>
            </Link>

            <div className="flex items-center gap-5">
                <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
                    Home
                </Link>

                {user ? (
                    <>
                        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
                            Dashboard
                        </Link>
                        <Link to="/generate" className="text-sm text-gray-500 hover:text-gray-900">
                            Generate
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-500 hover:text-gray-900"
                        >
                            Logout
                        </button>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/guest" className="text-sm text-gray-500 hover:text-gray-900">
                            Try as guest
                        </Link>
                        <Link
                            to="/login"
                            className="text-sm bg-emerald-700 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-800"
                        >
                            Sign in
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar


    