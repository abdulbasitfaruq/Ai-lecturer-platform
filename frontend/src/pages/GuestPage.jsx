import { useState } from 'react'
import { Link } from 'react-router-dom'
import { generateGuestLecture } from '../services/api'

function GuestPage() {
    const [topic, setTopic] = useState('')
    const [subject, setSubject] = useState('')
    const [difficulty, setDifficulty] = useState('intermediate')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [lecture, setLecture] = useState(null)

    const handleGenerate = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await generateGuestLecture(topic, subject, difficulty)
            setLecture(response.data.lecture)
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate lecture')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-amber-50 border-b border-amber-200 px-7 py-3 flex justify-between items-center">
                <p className="text-sm text-amber-700">
                    You're in guest mode. Lectures won't be saved. Sign up to keep your progress.
                </p>
                <Link to="/register" className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700">
                    Create account
                </Link>
            </div>

            {!lecture ? (
                <div className="max-w-lg mx-auto py-12">
                    <div className="bg-white rounded-2xl border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Try a free lecture
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            No account needed. Just pick a topic and start learning.
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm text-gray-500 mb-1">Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                                placeholder="e.g. Introduction to Python"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-500 mb-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                                placeholder="e.g. Computer Science"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-500 mb-1">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700 bg-white"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !topic || !subject}
                            className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
                        >
                            {loading ? 'Generating lecture...' : 'Generate lecture'}
                        </button>

                        {loading && (
                            <p className="text-sm text-gray-500 text-center mt-3">
                                This may take 15-30 seconds...
                            </p>
                        )}

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Guest lectures are temporary and cannot be saved or revisited
                        </p>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto py-8 px-4">
                    <button
                        onClick={() => setLecture(null)}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-4 block"
                    >
                        ← Generate another lecture
                    </button>

                    <div className="bg-white rounded-2xl border border-gray-200 p-8">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-xl font-bold text-gray-900">{lecture.topic}</h1>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                                {lecture.difficulty}
                            </span>
                        </div>
                        <div className="flex gap-3 text-sm text-gray-500 mb-6">
                            <span>{lecture.subject}</span>
                        </div>

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

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-4 text-center">
                        <p className="text-sm text-amber-700 mb-3">
                            Want to ask questions and save your lectures?
                        </p>
                        <Link to="/register" className="bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700">
                            Create a free account
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GuestPage