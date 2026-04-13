import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getAudioUrl, streamLecture, streamQuestion, saveLecture } from '../services/api'

function LiveLecturePage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const topic = searchParams.get('topic')
    const subject = searchParams.get('subject')
    const difficulty = searchParams.get('difficulty') || 'intermediate'
    const voice = searchParams.get('voice') || 'onyx'

    const [lectureText, setLectureText] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [audioFile, setAudioFile] = useState(null)
    const [generatingAudio, setGeneratingAudio] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentWordIndex, setCurrentWordIndex] = useState(-1)
    const [question, setQuestion] = useState('')
    const [isAsking, setIsAsking] = useState(false)
    const [answerText, setAnswerText] = useState('')
    const [answerAudio, setAnswerAudio] = useState(null)
    const [qaPairs, setQaPairs] = useState([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const audioRef = useRef(null)
    const fullContentRef = useRef('')
    const textContainerRef = useRef(null)
    const hasStartedRef = useRef(false)
    const highlightIntervalRef = useRef(null)
    const pausedAtWordRef = useRef(0)

    const user = JSON.parse(localStorage.getItem('user'))

    // Auto-scroll
    useEffect(() => {
        if (textContainerRef.current) {
            textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight
        }
    }, [lectureText, answerText])

    // Start streaming ONLY ONCE
    const startStreaming = async () => {
        if (hasStartedRef.current) return
        hasStartedRef.current = true

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
                                setAudioFile(data.filename)
                                setGeneratingAudio(false)
                            } else if (data.type === 'done') {
                                setIsStreaming(false)
                                setGeneratingAudio(true)
                            }
                        } catch {}
                    }
                }
            }

            if (!audioFile) {
                setIsFinished(true)
            }
        } catch {
            setError('Failed to stream lecture')
            setIsStreaming(false)
        }
    }

    useEffect(() => {
        if (topic && subject) {
            startStreaming()
        }
    }, [])

    // When audio file arrives, mark as finished
    useEffect(() => {
        if (audioFile) {
            setGeneratingAudio(false)
            setIsFinished(true)
        }
    }, [audioFile])

    // Play lecture audio with word highlighting
    const playLectureAudio = () => {
        if (!audioFile) return

        const audio = new Audio(getAudioUrl(audioFile))
        audioRef.current = audio

        audio.onplay = () => {
            setIsPlaying(true)
            startHighlighting(pausedAtWordRef.current)
        }

        audio.onpause = () => {
            setIsPlaying(false)
            stopHighlighting()
        }

        audio.onended = () => {
            setIsPlaying(false)
            setCurrentWordIndex(-1)
            stopHighlighting()
            pausedAtWordRef.current = 0
        }

        audio.play().catch(() => {})
    }

    // Resume from where we paused
    const resumeLectureAudio = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(() => {})
        } else {
            playLectureAudio()
        }
    }

    // Pause lecture audio
    const pauseLectureAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
    }

    // Word highlighting based on audio timing
    const startHighlighting = (startWord) => {
        const words = fullContentRef.current.split(/\s+/)
        if (words.length === 0 || !audioRef.current) return

        const totalDuration = audioRef.current.duration || 60
        const msPerWord = (totalDuration * 1000) / words.length

        let wordIndex = startWord

        highlightIntervalRef.current = setInterval(() => {
            if (wordIndex >= words.length) {
                stopHighlighting()
                return
            }
            setCurrentWordIndex(wordIndex)
            pausedAtWordRef.current = wordIndex
            wordIndex++

            // Auto-scroll to highlighted word
            if (textContainerRef.current) {
                const highlighted = textContainerRef.current.querySelector('.word-highlight')
                if (highlighted) {
                    highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }
        }, msPerWord)
    }

    const stopHighlighting = () => {
        if (highlightIntervalRef.current) {
            clearInterval(highlightIntervalRef.current)
            highlightIntervalRef.current = null
        }
    }

    // Ask question
    const handleAskQuestion = async () => {
        if (!question.trim()) return

        // Pause lecture audio
        pauseLectureAudio()

        setIsAsking(true)
        setAnswerText('')
        setAnswerAudio(null)

        const currentQuestion = question
        setQuestion('')

        let fullAnswer = ''

        try {
            const response = await streamQuestion(fullContentRef.current, currentQuestion, voice)
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
                                fullAnswer += data.content
                                setAnswerText(prev => prev + data.content)
                            } else if (data.type === 'audio') {
                                setAnswerAudio(data.filename)
                                // Play answer audio
                                const ansAudio = new Audio(getAudioUrl(data.filename))
                                ansAudio.play().catch(() => {})
                                ansAudio.onended = () => {
                                    // Answer audio done
                                }
                            } else if (data.type === 'done') {
                                setQaPairs(prev => [...prev, {
                                    question: currentQuestion,
                                    answer: fullAnswer
                                }])
                                setAnswerText('')
                                setIsAsking(false)
                            }
                        } catch {}
                    }
                }
            }
        } catch {
            setError('Failed to get answer')
            setIsAsking(false)
        }
    }

    // Save lecture
    const handleSave = async () => {
        if (!user) return
        setSaving(true)

        try {
            const response = await saveLecture(
                topic, subject, difficulty,
                fullContentRef.current,
                user.id,
                audioFile
            )
            navigate(`/lecture/${response.data.lecture.id}`)
        } catch {
            setError('Failed to save lecture')
            setSaving(false)
        }
    }

    // Render words with highlighting
    const renderWords = () => {
        const words = lectureText.split(/\s+/)
        return words.map((word, index) => (
            <span
                key={index}
                className={`${
                    index === currentWordIndex
                        ? 'bg-emerald-200 text-emerald-900 font-medium word-highlight'
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
                    {generatingAudio && (
                        <span className="text-sm text-emerald-200">Generating audio...</span>
                    )}
                    {isFinished && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-white text-emerald-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-50"
                        >
                            {saving ? 'Saving...' : 'Save to dashboard'}
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-6 px-4">
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Teleprompter Box */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                    <div
                        ref={textContainerRef}
                        className="min-h-40 max-h-96 overflow-y-auto leading-relaxed text-base"
                    >
                        {!lectureText && isStreaming && (
                            <span className="text-gray-400">Generating lecture...</span>
                        )}
                        {currentWordIndex >= 0 ? renderWords() : (
                            <span className="text-gray-700 whitespace-pre-line">{lectureText}</span>
                        )}
                        {isStreaming && (
                            <span className="inline-block w-2 h-5 bg-emerald-700 animate-pulse ml-1"></span>
                        )}
                    </div>
                </div>

                {/* Audio Player */}
                {audioFile && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex items-center gap-4">
                        <button
                            onClick={isPlaying ? pauseLectureAudio : resumeLectureAudio}
                            className="w-10 h-10 bg-emerald-700 text-white rounded-full flex items-center justify-center hover:bg-emerald-800 flex-shrink-0"
                        >
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                        <p className="text-sm text-gray-500">
                            {isPlaying ? 'Playing lecture...' : 'Click play to hear the lecture'}
                        </p>
                    </div>
                )}

                {/* Ask Question */}
                {(isStreaming || isFinished) && !isAsking && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                                placeholder="Ask a question about the lecture..."
                            />
                            <button
                                onClick={handleAskQuestion}
                                disabled={!question.trim()}
                                className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
                            >
                                Ask
                            </button>
                        </div>
                        {isPlaying && (
                            <p className="text-xs text-gray-400 mt-2">Asking will pause the lecture audio</p>
                        )}
                    </div>
                )}

                {/* Currently streaming answer */}
                {isAsking && (
                    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Answering...</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {answerText}
                            <span className="inline-block w-2 h-4 bg-emerald-700 animate-pulse ml-1"></span>
                        </p>
                    </div>
                )}

                {/* Continue lecture button after Q&A */}
                {!isAsking && qaPairs.length > 0 && audioFile && !isPlaying && (
                    <div className="mb-4">
                        <button
                            onClick={resumeLectureAudio}
                            className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800"
                        >
                            ▶ Continue lecture
                        </button>
                    </div>
                )}

                {/* Q&A Comment Section */}
                {qaPairs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Questions & Answers</h3>
                        {qaPairs.map((qa, index) => (
                            <div key={index} className="py-4 border-b border-gray-100 last:border-0">
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="text-xs bg-emerald-700 text-white w-5 h-5 rounded flex items-center justify-center font-bold flex-shrink-0 mt-0.5">Q</span>
                                    <p className="text-sm font-semibold text-gray-900">{qa.question}</p>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed pl-7">{qa.answer}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LiveLecturePage