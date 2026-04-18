import { Link } from 'react-router-dom'
import { generateGuestLecture, getAudioUrl } from '../services/api'
import { getLecturer } from '../Data/lecturers'
import LecturerAvatar from '../components/LecturerAvatar'
import { useState, useRef } from 'react'

function GuestPage() {
    const [topic, setTopic] = useState('')
    const [subject, setSubject] = useState('')
    const [difficulty, setDifficulty] = useState('intermediate')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [lecture, setLecture] = useState(null)
    const [visualFile, setVisualFile] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentWordIndex, setCurrentWordIndex] = useState(-1)
    const audioRef = useRef(null)

    const lecturer = getLecturer(subject)

    const handleGenerate = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        setVisualFile(null)
        setCurrentWordIndex(-1)
        setIsPlaying(false)
        audioRef.current = null

        try {
            const response = await generateGuestLecture(topic, subject, difficulty)
            setLecture(response.data.lecture)
            if (response.data.lecture.visual_url) {
                setVisualFile(response.data.lecture.visual_url)
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate')
        } finally {
            setLoading(false)
        }
    }

    const playAudio = () => {
        if (!lecture?.audio_file) return

        const audio = new Audio(getAudioUrl(lecture.audio_file))
        audioRef.current = audio

        audio.onloadedmetadata = () => {
            const totalDuration = audio.duration
            const words = lecture.content.split(/\s+/)
            const estimatedTimestamps = words.map((word, i) => ({
                start: (i / words.length) * totalDuration,
                end: ((i + 1) / words.length) * totalDuration,
            }))
            audio.ontimeupdate = () => {
                const index = estimatedTimestamps.findIndex(
                    w => audio.currentTime >= w.start && audio.currentTime <= w.end
                )
                if (index !== -1) setCurrentWordIndex(index)
            }
            audio.play().catch(console.error)
        }

        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.onended = () => {
            setIsPlaying(false)
            setCurrentWordIndex(-1)
        }
    }

    const toggleAudio = () => {
        if (isPlaying) {
            audioRef.current?.pause()
        } else {
            if (audioRef.current) {
                audioRef.current.play()
            } else {
                playAudio()
            }
        }
    }

    const renderWords = () => {
        if (!lecture) return null
        const words = lecture.content.split(/\s+/)
        return words.map((word, index) => (
            <span
                key={index}
                className={`${
                    index === currentWordIndex
                        ? 'bg-emerald-200 text-emerald-900 font-medium'
                        : index < currentWordIndex
                        ? 'text-gray-400'
                        : 'text-gray-700'
                } transition-colors duration-100`}
            >
                {word}{' '}
            </span>
        ))
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Guest Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-7 py-3 flex justify-between items-center sticky top-0 z-20">
                <p className="text-sm text-amber-700 font-medium">You're in guest mode. Sign up to save your lectures.</p>
                <Link to="/register" className="text-xs bg-amber-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-amber-700 transition-all">
                    Create account
                </Link>
            </div>

            {!lecture ? (
                /* --- FORM VIEW --- */
                <div className="max-w-lg mx-auto py-12 px-4">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                            🎓
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Try a free lecture</h2>
                        <p className="text-sm text-gray-500 mt-2">Create a comprehensive lesson tailored to your level</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 p-8">
                        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topic</label>
                            <input
                                type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !loading && topic && subject && handleGenerate(e)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                                placeholder="e.g. Sorting algorithms"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                            <input
                                type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                                placeholder="e.g. Computer Science"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulty</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['beginner', 'intermediate', 'advanced'].map((level) => (
                                    <button key={level} onClick={() => setDifficulty(level)}
                                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            difficulty === level ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {subject && (
                            <div className="bg-emerald-50 rounded-2xl p-5 mb-6 border border-emerald-100 text-left">
                                <p className="text-[10px] font-bold text-emerald-800 uppercase mb-3 tracking-widest">Your assigned lecturer</p>
                                <LecturerAvatar lecturer={lecturer} isSpeaking={false} />
                                <p className="text-xs text-gray-500 mt-3 leading-relaxed italic">{lecturer.bio}</p>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-4 mb-4">
                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500">Generating lecture and visual...</p>
                                <p className="text-xs text-gray-400 mt-1">This may take 15-20 seconds</p>
                            </div>
                        )}

                        <button
                            onClick={handleGenerate} disabled={loading || !topic || !subject}
                            className="w-full bg-emerald-700 text-white py-3.5 rounded-2xl font-bold hover:bg-emerald-800 disabled:bg-gray-300 shadow-lg shadow-emerald-100 transition-all hover:scale-[1.01]"
                        >
                            {loading ? 'AI is composing your lecture...' : 'Generate free lecture'}
                        </button>
                    </div>
                </div>
            ) : (
                /* --- LECTURE RESULT VIEW --- */
                <div className="max-w-6xl mx-auto py-8 px-4">
                    <button
                        onClick={() => {
                            audioRef.current?.pause()
                            setLecture(null)
                            setVisualFile(null)
                            setCurrentWordIndex(-1)
                            setIsPlaying(false)
                            audioRef.current = null
                        }}
                        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors font-medium"
                    >
                        ← Create another lecture
                    </button>

                    {/* Lecturer Header */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center justify-between shadow-sm">
                        <LecturerAvatar lecturer={lecturer} isSpeaking={isPlaying} large={true} />
                        <div className="flex items-center gap-3">
                            {lecture.audio_file && (
                                <button
                                    onClick={toggleAudio}
                                    className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xl shadow-lg hover:bg-emerald-800 transition-all"
                                >
                                    {isPlaying ? '⏸' : '▶'}
                                </button>
                            )}
                            <span className="hidden md:block text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase font-bold tracking-widest border border-emerald-200">
                                Guest Preview
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 mb-8">
                        {/* Content */}
                        <div className={`bg-white rounded-3xl border border-gray-200 shadow-sm p-8 ${visualFile ? 'lg:w-2/3' : 'w-full'}`}>
                            <div className="mb-6">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{lecture.topic}</h1>
                                <div className="flex items-center gap-3 text-sm text-emerald-600 font-semibold bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                                    <span>{lecture.subject}</span>
                                    <span className="text-emerald-300">•</span>
                                    <span className="capitalize">{lecture.difficulty}</span>
                                </div>
                            </div>

                            <div className="text-lg leading-relaxed">
                                {currentWordIndex >= 0 ? renderWords() : (
                                    <p className="text-gray-700 whitespace-pre-line">{lecture.content}</p>
                                )}
                            </div>

                            {lecture.summary && (
                                <div className="mt-10 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Quick Summary</h3>
                                    <p className="text-gray-600 leading-relaxed">{lecture.summary}</p>
                                </div>
                            )}
                        </div>

                        {/* Visual Blackboard */}
                        {visualFile ? (
                            <div className="w-full lg:w-1/3">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-5 sticky top-24">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Blackboard</p>
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    </div>
                                    <img
                                        src={getAudioUrl(visualFile)}
                                        alt="Lecture diagram"
                                        className="w-full rounded-xl border border-gray-100"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-3 text-center italic leading-tight">
                                        AI-generated visual aid for this lecture
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full lg:w-1/3">
                                <div className="bg-gray-900 rounded-3xl p-5 flex items-center justify-center min-h-[200px]">
                                    <div className="text-center">
                                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-emerald-400 text-xs">Visual still loading...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 text-center shadow-sm">
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Want the full experience?</h3>
                        <p className="text-sm text-amber-700 mb-6 max-w-md mx-auto leading-relaxed">
                            Registered students get <strong>live streaming lectures</strong>, real-time <strong>Q&A with {lecturer.name}</strong>, and a dashboard to save all progress.
                        </p>
                        <Link to="/register" className="inline-block bg-amber-600 text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-200">
                            Create Free Account
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GuestPage