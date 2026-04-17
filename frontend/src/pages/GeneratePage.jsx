import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getLecturer } from '../Data/lecturers'
import LecturerAvatar from '../components/LecturerAvatar'

function GeneratePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [topic, setTopic] = useState('')
    const [subject, setSubject] = useState(searchParams.get('subject') || '')
    const [difficulty, setDifficulty] = useState('intermediate')

    const lecturer = getLecturer(subject)

    const handleGenerate = (e) => {
        e.preventDefault()
        navigate(`/live?topic=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject)}&difficulty=${difficulty}&voice=${lecturer.voice}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                        🎓
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Generate a new lecture
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Your AI lecturer will create a comprehensive lesson tailored to your level
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100 p-8">
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="e.g. Sorting algorithms, Quantum mechanics"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="e.g. Computer Science, Physics"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['beginner', 'intermediate', 'advanced'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        difficulty === level
                                            ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lecturer Preview */}
                    {subject && (
                        <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-800 uppercase mb-3">Your lecturer</p>
                            <LecturerAvatar lecturer={lecturer} isSpeaking={false} />
                            <p className="text-xs text-gray-500 mt-3 leading-relaxed">{lecturer.bio}</p>
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={!topic || !subject}
                        className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 disabled:bg-gray-300 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Generate lecture
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GeneratePage

    


