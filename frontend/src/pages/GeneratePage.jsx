import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function GeneratePage() {
    const navigate = useNavigate()
    const [topic, setTopic] = useState('')
    const [subject, setSubject] = useState('')
    const [difficulty, setDifficulty] = useState('intermediate')
    const [voice, setVoice] = useState('onyx')

    const handleGenerate = (e) => {
        e.preventDefault()
        navigate(`/live?topic=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject)}&difficulty=${difficulty}&voice=${voice}`)
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

                    <div className="mb-6">
                        <label className="block text-sm text-gray-500 mb-1">AI Voice</label>
                        <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700 bg-white"
                        >
                            <option value="onyx">Onyx — deep, authoritative</option>
                            <option value="nova">Nova — friendly, energetic</option>
                            <option value="echo">Echo — warm, smooth</option>
                            <option value="alloy">Alloy — neutral, balanced</option>
                            <option value="fable">Fable — British, storytelling</option>
                            <option value="shimmer">Shimmer — soft, gentle</option>
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!topic || !subject}
                        className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
                    >
                        Generate lecture
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GeneratePage

    


