import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUserLectures } from '../services/api'
import { getLecturer } from '../Data/lecturers'
import LecturerAvatar from '../components/LecturerAvatar'

function HomePage() {
    const location = useLocation()
    const navigate = useNavigate()
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

    const handleSubjectClick = (subject) => {
        if (user) {
            navigate(`/generate?subject=${encodeURIComponent(subject)}`)
        } else {
            navigate('/register')
        }
    }

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-emerald-50 to-white py-20 text-center">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full inline-block animate-pulse">
                    AI-powered learning
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mt-6 leading-tight">
                    Your personal <span className="text-emerald-700">AI lecturer</span>
                    <br />for any subject
                </h1>
                <p className="text-gray-500 mt-5 max-w-lg mx-auto text-base leading-relaxed">
                    Get university-quality lectures instantly. Ask questions, listen to audio,
                    and learn at your own pace — all powered by artificial intelligence.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    {user ? (
                        <>
                            <Link to="/generate" className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-800 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:scale-105">
                                Generate new lecture
                            </Link>
                            <Link to="/dashboard" className="bg-white text-emerald-700 px-8 py-3 rounded-xl font-semibold border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                                Go to dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-800 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:scale-105">
                                Start learning free
                            </Link>
                            <Link to="/guest" className="bg-white text-emerald-700 px-8 py-3 rounded-xl font-semibold border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                                Try as guest
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Recent Lectures with Lecturer Info */}
            {user && lectures.length > 0 && (
                <div className="py-16 px-7 max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Continue learning</h2>
                        <Link to="/dashboard" className="text-sm text-emerald-700 font-semibold hover:text-emerald-800">
                            View all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                        {lectures.slice(0, 3).map((lecture) => {
                            const lecturer = getLecturer(lecture.subject)
                            return (
                                <Link
                                    key={lecture.id}
                                    to={`/lecture/${lecture.id}`}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-102 transition-all group"
                                >
                                    <div className="h-14 bg-gradient-to-r from-emerald-800 to-emerald-500 flex items-center gap-3 px-5">
                                        {lecturer.image ? (
                                            <img src={lecturer.image} alt={lecturer.name} className="w-9 h-9 rounded-full border-2 border-white/40" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                                                {lecturer.initials}
                                            </div>
                                        )}
                                        <span className="text-white text-xs font-medium">{lecturer.name}</span>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{lecture.topic}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{lecture.subject}</p>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                                                {lecture.difficulty}
                                            </span>
                                            {lecture.visual_url && (
                                                <span className="text-xs text-gray-400">Has visual</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Meet Your Lecturers */}
            <div className="py-16 px-7 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Meet your AI lecturers</h2>
                    <p className="text-gray-500 text-center mb-10">Expert lecturers powered by AI, each specializing in their field</p>
                    <div className="grid grid-cols-3 gap-5">
                        {[
                            { subject: "Computer Science", desc: "Algorithms, data structures, AI" },
                            { subject: "Physics", desc: "Mechanics, quantum, thermodynamics" },
                            { subject: "Mathematics", desc: "Calculus, algebra, statistics" },
                            { subject: "Biology", desc: "Cells, genetics, ecosystems" },
                            { subject: "Chemistry", desc: "Molecules, reactions, organic" },
                        ].map((item) => {
                            const lecturer = getLecturer(item.subject)
                            return (
                                <div
                                    key={item.subject}
                                    onClick={() => handleSubjectClick(item.subject)}
                                    className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all group"
                                >
                                    <LecturerAvatar lecturer={lecturer} isSpeaking={false} />
                                    <p className="text-xs text-gray-400 mt-3">{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* What makes us different */}
            <div className="py-16 px-7">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">What makes us different</h2>
                    <p className="text-gray-500 text-center mb-10">Built for students who want to learn smarter, not harder</p>
                    <div className="grid grid-cols-4 gap-5">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
                                ⚡
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">Instant lectures</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Full structured lectures generated in under 30 seconds on any topic.</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
                                💬
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">Smart Q&A</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Ask questions mid-lecture and get instant answers from your AI lecturer.</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
                                🎧
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">Audio + Sync</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Listen to lectures with word-by-word highlighting synced to audio.</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
                                🖼
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">AI Visuals</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Gemini generates educational diagrams that match your lecture content.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="py-16 px-7 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How it works</h2>
                    <div className="grid grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-emerald-200">
                                1
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Choose your topic</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Pick any subject and topic. Set your difficulty level from beginner to advanced.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-emerald-200">
                                2
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Watch & listen</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Your AI lecturer streams the lesson live with synced audio and visuals.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-emerald-200">
                                3
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Ask & interact</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Pause anytime to ask questions. Your lecturer answers with audio and text.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
        
            


