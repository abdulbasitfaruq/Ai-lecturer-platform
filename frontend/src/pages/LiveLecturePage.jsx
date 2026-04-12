import { useState, useRef, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { getAudioUrl, streamLecture, streamQuestion } from '../services/api'
import { generateLecture } from '../services/api'

function LiveLecturePage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const topic = searchParams.get('topic')
    const subject = searchParams.get('subject')
    const difficulty = searchParams.get('difficulty') || 'intermediate'
    const voice = searchParams.get('voice') || 'onyx'

    const [lectureText, setLectureText] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [audioQueue, setAudioQueue] = useState([])
    const [currentAudio, setCurrentAudio] = useState(null)
    const [question, setQuestion] = useState('')
    const [isAsking, setIsAsking] = useState(false)
    const [qaPairs, setQaPairs] = useState([])
    const [answerText, setAnswerText] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const textRef = useRef(null)
    const audioRef = useRef(null)
    const pausedRef = useRef(false)
    const fullContentRef = useRef('')

    const user = JSON.parse(localStorage.getItem('user'))

    // Auto-scroll text as it streams
    useEffect(() => {
        if (textRef.current) {
            textRef.current.scrollTop = textRef.current.scrollHeight
        }
    }, [lectureText, answerText])

    // Play audio queue
    useEffect(() => {
        if (audioQueue.length > 0 && !currentAudio && !pausedRef.current) {
            const nextAudio = audioQueue[0]
            const audio = new Audio(getAudioUrl(nextAudio))
            audioRef.current = audio
            setCurrentAudio(nextAudio)

            audio.play().catch(() => {})

            audio.onended = () => {
                setAudioQueue(prev => prev.slice(1))
                setCurrentAudio(null)
                audioRef.current = null
            }
        }
    }, [audioQueue, currentAudio])


    const startStreaming = async () => {
        setIsStreaming(true)
        setLectureText('')
        fullContentRef.current = ''

        try {
            const response = await streamLecture(topic, subject, difficulty, voice)
            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const text = decoder.decode(value)
                const lines = text.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))

                            if (data.type === 'text') {
                                setLectureText(prev => prev + data.content)
                                fullContentRef.current += data.content
                            } else if (data.type === 'audio') {
                                setAudioQueue(prev => [...prev, data.filename])
                            } else if (data.type === 'done') {
                                setIsFinished(true)
                                setIsStreaming(false)
                            }
                        } catch (e) {}
                    }
                }

                // Wait if paused
                while (pausedRef.current) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            }
        } catch (err) {
            setError('Failed to stream lecture')
            setIsStreaming(false)
        }
    }
    // Start streaming when page loads
    useEffect(() => {
        if (topic && subject) {
            startStreaming()
        }
    }, [])

    const handlePause = () => {
        pausedRef.current = true
        setIsPaused(true)
        if (audioRef.current) {
            audioRef.current.pause()
        }
    }

    const handleResume = () => {
        pausedRef.current = false
        setIsPaused(false)
        if (audioRef.current) {
            audioRef.current.play().catch(() => {})
        }
    }

    const handleAskQuestion = async () => {
        if (!question.trim()) return

        // Pause the lecture
        handlePause()
        setIsAsking(true)
        setAnswerText('')

        const currentQuestion = question
        setQuestion('')

        try {
            const response = await streamQuestion(fullContentRef.current, currentQuestion, voice)
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let fullAnswer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const text = decoder.decode(value)
                const lines = text.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))

                            if (data.type === 'text') {
                                fullAnswer += data.content
                                setAnswerText(prev => prev + data.content)
                            } else if (data.type === 'audio') {
                                setAudioQueue(prev => [...prev, data.filename])
                            } else if (data.type === 'done') {
                                setQaPairs(prev => [...prev, {
                                    question: currentQuestion,
                                    answer: fullAnswer
                                }])
                                setAnswerText('')
                                setIsAsking(false)
                            }
                        } catch (e) {}
                    }
                }
            }
        } catch (err) {
            setError('Failed to get answer')
            setIsAsking(false)
        }
    }

    const handleSave = async () => {
        if (!user) return
        setSaving(true)

        try {
            const response = await generateLecture(topic, subject, difficulty, user.id, voice)
            navigate(`/lecture/${response.data.lecture.id}`)
        } catch (err) {
            setError('Failed to save lecture')
            setSaving(false)
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-emerald-700 px-7 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold text-white">{topic}</h1>
                    <p className="text-emerald-200 text-sm">{subject} · {difficulty}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isStreaming && (
                        <span className="flex items-center gap-2 text-sm text-emerald-200">
                            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            Live
                        </span>
                    )}
                    {isFinished && (
                        <span className="text-sm text-emerald-200">Lecture complete</span>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-6 px-4">
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Lecture Content */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                    <div
                        ref={textRef}
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto"
                    >
                        {lectureText}
                        {isStreaming && !isPaused && (
                            <span className="inline-block w-2 h-4 bg-emerald-700 animate-pulse ml-1"></span>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 mb-4">
                    {isStreaming && !isPaused && (
                        <button
                            onClick={handlePause}
                            className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600"
                        >
                            ⏸ Pause
                        </button>
                    )}
                    {isPaused && !isAsking && (
                        <button
                            onClick={handleResume}
                            className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800"
                        >
                            ▶ Continue lecture
                        </button>
                    )}
                    {isFinished && (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
                            >
                                {saving ? 'Saving...' : 'Save to dashboard'}
                            </button>
                            <Link
                                to="/dashboard"
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300"
                            >
                                Back to dashboard
                            </Link>
                        </>
                    )}
                </div>

                {/* Q&A During Lecture */}
                {qaPairs.map((qa, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-emerald-700 text-white w-5 h-5 rounded flex items-center justify-center font-bold">Q</span>
                            <p className="text-sm font-semibold text-gray-900">{qa.question}</p>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed pl-7">{qa.answer}</p>
                    </div>
                ))}

                {/* Currently Streaming Answer */}
                {isAsking && (
                    <div className="bg-white rounded-2xl border border-emerald-300 p-4 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-emerald-700 text-white w-5 h-5 rounded flex items-center justify-center font-bold">Q</span>
                            <p className="text-sm font-semibold text-gray-900">{qaPairs.length > 0 ? '' : ''}{question || 'Your question'}</p>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed pl-7">
                            {answerText}
                            <span className="inline-block w-2 h-4 bg-emerald-700 animate-pulse ml-1"></span>
                        </p>
                    </div>
                )}

                {/* Ask Question Input */}
                {(isStreaming || isPaused || isFinished) && !isAsking && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Ask a question</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                                placeholder="Type your question..."
                            />
                            <button
                                onClick={handleAskQuestion}
                                disabled={!question.trim()}
                                className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
                            >
                                Ask
                            </button>
                        </div>
                        {isStreaming && (
                            <p className="text-xs text-gray-400 mt-2">Asking a question will pause the lecture</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LiveLecturePage