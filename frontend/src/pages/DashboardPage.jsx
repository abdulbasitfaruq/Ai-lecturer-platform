import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserLectures, getLectureQuestion } from '../services/api'
import { getLecturer } from '../Data/lecturers'
import { getAudioUrl } from '../services/api'

function DashboardPage() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [lectures, setLectures] = useState([])
    const [loading, setLoading] = useState(true)
    const [questionCount, setQuestionCount] = useState(0)

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (!savedUser) {
            navigate('/login')
            return
        }

        const userData = JSON.parse(savedUser)
        setUser(userData)

        getUserLectures(userData.id)
            .then((response) => {
                setLectures(response.data.lectures || [])
                setLoading(false)

                let totalQuestions = 0
                const lectureList = response.data.lectures || []

                lectureList.forEach((lecture) => {
                    getLectureQuestion(lecture.id)
                        .then((qResponse) => {
                            totalQuestions += (qResponse.data.questions || []).length
                            setQuestionCount(totalQuestions)
                        })
                        .catch(() => {})
                })
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    if (!user) return null

    const subjectCount = [...new Set(lectures.map(l => l.subject))].length

    const profileColor = localStorage.getItem('profileColor') || 'emerald'
    const colorMap = {
        emerald: 'from-emerald-700 to-emerald-500',
        blue: 'from-blue-700 to-blue-500',
        purple: 'from-purple-700 to-purple-500',
        amber: 'from-amber-700 to-amber-500',
        rose: 'from-rose-700 to-rose-500',
        cyan: 'from-cyan-700 to-cyan-500'
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className={`bg-gradient-to-r ${colorMap[profileColor] || colorMap.emerald} px-7 py-10`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Welcome back, {user.username}
                            </h1>
                            <p className="text-white/70 text-sm">
                                Keep up the momentum — you're doing great
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                            <p className="text-3xl font-bold text-white">{lectures.length}</p>
                            <p className="text-xs text-white/70 mt-1">Lectures</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                            <p className="text-3xl font-bold text-white">{questionCount}</p>
                            <p className="text-xs text-white/70 mt-1">Questions Asked</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                            <p className="text-3xl font-bold text-white">{subjectCount}</p>
                            <p className="text-xs text-white/70 mt-1">Subjects</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                            <p className="text-3xl font-bold text-white">{lectures.length > 0 ? 1 : 0}</p>
                            <p className="text-xs text-white/70 mt-1">Day Streak 🔥</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lectures */}
            <div className="max-w-6xl mx-auto px-7 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your lectures</h2>
                    <Link to="/generate" className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-800 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:scale-105">
                        + Generate new lecture
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading your lectures...</p>
                    </div>
                ) : lectures.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                            🎓
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">No lectures yet</h3>
                        <p className="text-gray-500 text-sm mb-6">Generate your first AI-powered lecture to get started</p>
                        <Link to="/generate" className="bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-800 inline-block">
                            Generate your first lecture
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {lectures.map((lecture) => {
                            const lecturer = getLecturer(lecture.subject)
                            return (
                                <Link
                                    key={lecture.id}
                                    to={`/lecture/${lecture.id}`}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all group"
                                >
                                    {/* Visual thumbnail or gradient */}
                                    {lecture.visual_url ? (
                                        <div className="h-32 overflow-hidden">
                                            <img
                                                src={getAudioUrl(lecture.visual_url)}
                                                alt="Lecture visual"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ) : (
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
                                    )}
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            {lecture.visual_url && lecturer.image && (
                                                <img src={lecturer.image} alt={lecturer.name} className="w-6 h-6 rounded-full" />
                                            )}
                                            {lecture.visual_url && (
                                                <span className="text-xs text-gray-400">{lecturer.name}</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{lecture.topic}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{lecture.subject}</p>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                                                {lecture.difficulty}
                                            </span>
                                            <div className="flex gap-1">
                                                {lecture.audio_file && <span className="text-xs text-gray-400">🔊</span>}
                                                {lecture.visual_url && <span className="text-xs text-gray-400">🖼</span>}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardPage