import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserLectures, askQuestion, getLectureQuestion } from '../services/api'

function LecturePage() {
    const { id } = useParams()
    const [lecture, setLecture] = useState(null)
    const [questions, setQuestions] = useState([])
    const [newQuestion, setNewQuestion] = useState('')
    const [loading, setLoading] = useState(true)
    const [asking, setAsking] = useState(false)
    const [error, setError] = useState('')

    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        getUserLectures(user.id)
            .then((response) => {
                const found = response.data.lectures.find(
                    (l) => l.id === parseInt(id)
                )
                setLecture(found)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load lecture')
                setLoading(false)
            })

        getLectureQuestion(id)
            .then((response) => {
                setQuestions(response.data.questions)
            })
            .catch(() => {})
    }, [])

    const handleAsk = async () => {
        if (!newQuestion.trim()) return
        setAsking(true)

        try {
            const response = await askQuestion(parseInt(id), user.id, newQuestion)
            setQuestions([...questions, response.data.question])
            setNewQuestion('')
        } catch (err) {
            const detail = err.response?.data?.detail
if (typeof detail === 'string') {
    setError(detail)
} else if (Array.isArray(detail)) {
    setError(detail.map(d => d.msg).join(', '))
} else {
    setError('Failed to ask question')
}
        } finally {
            setAsking(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading lecture...</p>
            </div>
        )
    }

    if (!lecture) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Lecture not found</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 mb-4 block">
                    ← Back to dashboard
                </Link>

                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-xl font-bold text-gray-900">{lecture.topic}</h1>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                            {lecture.difficulty}
                        </span>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-500 mb-6">
                        <span>{lecture.subject}</span>
                    </div>
                    {lecture.audio_file && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-4">
                            <audio
                                controls
                                className="w-full"
                                src={`http://localhost:8000/audio/${lecture.audio_file}`}
                            >
                                Your browser does not support audio.
                            </audio>
                        </div>
                    )}

                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {lecture.content}
                    </div>

                    {lecture.summary && (
                        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-emerald-800 mb-1">Summary</h3>
                            <p className="text-sm text-emerald-700">{lecture.summary}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ask about this lecture</h3>

                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                            placeholder="Type your question here..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        />
                        <button
                            onClick={handleAsk}
                            disabled={asking || !newQuestion.trim()}
                            className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
                        >
                            {asking ? 'Asking...' : 'Ask'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {questions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">
                            No questions yet. Ask something about the lecture!
                        </p>
                    ) : (
                        <div>
                            {questions.map((q, index) => (
                                <div key={index} className="py-4 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs bg-emerald-700 text-white w-5 h-5 rounded flex items-center justify-center font-bold">
                                            Q
                                        </span>
                                        <p className="text-sm font-semibold text-gray-900">{q.question}</p>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed pl-7">{q.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LecturePage