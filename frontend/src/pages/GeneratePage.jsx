import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateLecture } from '../services/api'

function GeneratePage() {
    const navigate = useNavigate()
    const [topic, setTopic] = useState('')
    const [subject, setSubject] = useState('')
    const [difficulty, setDifficulty] = useState('intermediate')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const user = JSON.parse(localStorage.getItem('user'))

    const handleGenerate = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await generateLecture(topic, subject, difficulty, user.id)
            navigate(`/lecture/${response.data.lecture.id}`)
        } catch (err) {
            const detail = err.response?.data?.detail
if (typeof detail === 'string') {
    setError(detail)
} else if (Array.isArray(detail)) {
    setError(detail.map(d => d.msg).join(', '))
} else {
    setError('Failed to generate lecture')
}
        } finally {
            setLoading(false)
        }
    }

        return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Generate a new lecture
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Your AI lecturer will create a comprehensive lesson tailored to your level.
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
                            placeholder="e.g. Sorting algorithms, Quantum mechanics"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm text-gray-500 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                            placeholder="e.g. Computer Science, Physics"
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
                </div>
            </div>
        </div>
    )
}

export default GeneratePage

    


