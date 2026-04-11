import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUserLectures } from '../services/api'

function HomePage() {
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [lectures, setLectures] = useState([])

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            const userData = JSON.parse(savedUser)
            setUser(userData)

            getUserLectures(userData.id)
                .then((response) => {
                    setLectures(response.data.lectures || [])
                })
                .catch(() => {})
        } else {
            setUser(null)
            setLectures([])
        }
    }, [location])

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gray-50 py-16 text-center">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full">
                    AI-powered learning
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-4">
                    Your personal <span className="text-emerald-700">AI lecturer</span>
                    <br />for any subject
                </h1>
                <p className="text-gray-500 mt-4 max-w-lg mx-auto">
                    Get university-quality lectures instantly. Ask questions, listen to audio,
                    and learn at your own pace — all powered by artificial intelligence.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    {user ? (
                        <>
                            <Link to="/generate" className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-800">
                                Generate new lecture
                            </Link>
                            <Link to="/dashboard" className="bg-emerald-100 text-emerald-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-200">
                                Go to dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-800">
                                Start learning free
                            </Link>
                            <Link to="/guest" className="bg-emerald-100 text-emerald-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-200">
                                Try as guest
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Recent Lectures (only for logged in users) */}
            {user && lectures.length > 0 && (
                <div className="py-14 px-7">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Your recent lectures</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {lectures.slice(0, 3).map((lecture) => (
                            <Link
                                key={lecture.id}
                                to={`/lecture/${lecture.id}`}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md"
                            >
                                <div className="h-12 bg-gradient-to-r from-emerald-900 to-emerald-600"></div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-sm">{lecture.topic}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{lecture.subject}</p>
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-2 inline-block">
                                        {lecture.difficulty}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* What makes us different */}
            <div className="py-14 px-7 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">What makes us different</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                        <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">
                            ⚡
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Instant lectures</h3>
                        <p className="text-xs text-gray-500">Full structured lectures generated in under 30 seconds on any topic.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                        <div className="w-11 h-11 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">
                            💬
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Smart Q&A</h3>
                        <p className="text-xs text-gray-500">Ask questions and get answers that reference your specific lecture content.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                        <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">
                            🎧
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Audio playback</h3>
                        <p className="text-xs text-gray-500">Listen to lectures with natural AI voice. Learn while commuting or relaxing.</p>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="py-14 px-7">
                <h2 className="text-xl font-bold text-gray-900 mb-6">How it works</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                            1
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Choose your topic</h3>
                        <p className="text-xs text-gray-500">Pick any subject and topic. Set your difficulty level from beginner to advanced.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                            2
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Get your lecture</h3>
                        <p className="text-xs text-gray-500">AI generates a structured, detailed lecture tailored to your level in seconds.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                            3
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Learn and interact</h3>
                        <p className="text-xs text-gray-500">Read or listen, then ask questions. Your AI lecturer answers based on the lesson.</p>
                    </div>
                </div>
            </div>

            {/* Popular Subjects */}
            <div className="py-14 px-7 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Popular subjects</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md">
                        <div className="h-14 bg-gradient-to-r from-emerald-900 to-emerald-600 flex items-center justify-center text-2xl">
                            💻
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-sm">Computer science</h3>
                            <p className="text-xs text-gray-500 mt-1">Algorithms, data structures, networking</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md">
                        <div className="h-14 bg-gradient-to-r from-amber-700 to-amber-500 flex items-center justify-center text-2xl">
                            ⚛
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-sm">Physics</h3>
                            <p className="text-xs text-gray-500 mt-1">Mechanics, thermodynamics, quantum</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md">
                        <div className="h-14 bg-gradient-to-r from-purple-800 to-purple-500 flex items-center justify-center text-2xl">
                            🔢
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-sm">Mathematics</h3>
                            <p className="text-xs text-gray-500 mt-1">Calculus, algebra, statistics, proofs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
        
            


