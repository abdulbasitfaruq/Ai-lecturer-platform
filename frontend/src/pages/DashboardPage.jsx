import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserLectures, getLectureQuestion } from '../services/api'

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

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-emerald-700 px-7 py-8">
                <h1 className="text-xl font-bold text-white">
                    Welcome back, {user.username}
                </h1>
                <p className="text-emerald-200 text-sm mt-1">
                    Keep up the momentum
                </p>
                <div className="grid grid-cols-4 gap-3 mt-5">
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{lectures.length}</p>
                        <p className="text-xs text-emerald-200">Lectures</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{questionCount}</p>
                        <p className="text-xs text-emerald-200">Questions</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{subjectCount}</p>
                        <p className="text-xs text-emerald-200">Subjects</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{lectures.length > 0 ? 1 : 0}</p>
                        <p className="text-xs text-emerald-200">Day streak</p>
                    </div>
                </div>
            </div>

            <div className="px-7 py-8">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Your lectures</h2>
                    <Link to="/generate" className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800">
                        Generate new lecture
                    </Link>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Loading your lectures...</p>
                ) : lectures.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                        <p className="text-gray-500 mb-3">You haven't generated any lectures yet.</p>
                        <Link to="/generate" className="text-emerald-700 font-semibold text-sm">
                            Generate your first lecture
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {lectures.map((lecture) => {
                            const lecturer = getLecturer(lecture.subject)
                            return (
                                <Link
                                    key={lecture.id}
                                    to={`/lecture/${lecture.id}`}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md"
                                >
                                    <div className="h-12 bg-gradient-to-r from-emerald-900 to-emerald-600 flex items-center gap-3 px-4">
                                        <img src={lecturer.image} alt={lecturer.name} className="w-8 h-8 rounded-full border border-white/50" />
                                        <span className="text-white text-xs font-medium">{lecturer.name}</span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 text-sm">{lecture.topic}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{lecture.subject}</p>
                                        <div className="flex justify-between items-center mt-3">
                                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                             {lecture.difficulty}
                                          </span>
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