import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { streamLecture, streamQuestion, saveLecture } from '../services/api'

function LiveLecturePage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const topic = searchParams.get('topic')
    const subject = searchParams.get('subject')
    const difficulty = searchParams.get('difficulty') || 'intermediate'
    const voice = searchParams.get('voice') || 'onyx'

    const [sentences, setSentences] = useState([])
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1)
    const [isStreaming, setIsStreaming] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [question, setQuestion] = useState('')
    const [isAsking, setIsAsking] = useState(false)
    const [answerSentences, setAnswerSentences] = useState([])
    const [currentAnswerIndex, setCurrentAnswerIndex] = useState(-1)
    const [qaPairs, setQaPairs] = useState([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const audioQueueRef = useRef([])
    const isPlayingRef = useRef(false)
    const currentAudioRef = useRef(null)
    const fullContentRef = useRef('')
    const textContainerRef = useRef(null)
    const shouldStopRef = useRef(false)

    const user = JSON.parse(localStorage.getItem('user'))

    // Auto-scroll
    useEffect(() => {
        if (textContainerRef.current) {
            textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight
        }
    }, [sentences, answerSentences])

    // Play next audio in queue
    const playNextInQueue = () => {
        if (shouldStopRef.current || audioQueueRef.current.length === 0) {
            isPlayingRef.current = false
            return
        }

        isPlayingRef.current = true
        const { audio, index, isAnswer } = audioQueueRef.current.shift()

        // Highlight current sentence
        if (isAnswer) {
            setCurrentAnswerIndex(index)
        } else {
            setCurrentSentenceIndex(index)
        }

        // Decode base64 audio and play
        const audioBytes = atob(audio)
        const arrayBuffer = new ArrayBuffer(audioBytes.length)
        const view = new Uint8Array(arrayBuffer)
        for (let i = 0; i < audioBytes.length; i++) {
            view[i] = audioBytes.charCodeAt(i)
        }
        const blob = new Blob([arrayBuffer], { type: 'audio/mp3' })
        const url = URL.createObjectURL(blob)

        const audioElement = new Audio(url)
        currentAudioRef.current = audioElement

        audioElement.onended = () => {
            currentAudioRef.current = null
            URL.revokeObjectURL(url)
            playNextInQueue()
        }

        audioElement.play().catch(() => {
            playNextInQueue()
        })
    }

    // Add audio to queue
    const addToQueue = (audio, index, isAnswer = false) => {
        audioQueueRef.current.push({ audio, index, isAnswer })
        if (!isPlayingRef.current) {
            playNextInQueue()
        }
    }

    // Stop all audio
    const stopAllAudio = () => {
        shouldStopRef.current = true
        audioQueueRef.current = []
        if (currentAudioRef.current) {
            currentAudioRef.current.pause()
            currentAudioRef.current = null
        }
        isPlayingRef.current = false
        setCurrentSentenceIndex(-1)
        setCurrentAnswerIndex(-1)
    }

    // Start streaming lecture
    const startStreaming = async () => {
        setIsStreaming(true)
        setSentences([])
        fullContentRef.current = ''
        shouldStopRef.current = false
        let sentenceIndex = 0

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

                            if (data.type === 'chunk') {
                                fullContentRef.current += data.text + ' '
                                const idx = sentenceIndex
                                setSentences(prev => [...prev, data.text])

                                if (data.audio) {
                                    addToQueue(data.audio, idx, false)
                                }
                                sentenceIndex++
                            } else if (data.type === 'done') {
                                setIsFinished(true)
                                setIsStreaming(false)
                            }
                        } catch {}
                    }
                }
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

    // Ask question
    const handleAskQuestion = async () => {
        if (!question.trim()) return

        stopAllAudio()
        shouldStopRef.current = false

        setIsAsking(true)
        setAnswerSentences([])
        setCurrentAnswerIndex(-1)

        const currentQuestion = question
        setQuestion('')

        let answerIndex = 0
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

                            if (data.type === 'chunk') {
                                fullAnswer += data.text + ' '
                                const idx = answerIndex
                                setAnswerSentences(prev => [...prev, data.text])

                                if (data.audio) {
                                    addToQueue(data.audio, idx, true)
                                }
                                answerIndex++
                            } else if (data.type === 'done') {
                                setQaPairs(prev => [...prev, {
                                    question: currentQuestion,
                                    answer: fullAnswer.trim()
                                }])
                                setAnswerSentences([])
                                setCurrentAnswerIndex(-1)
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
                null
            )
            navigate(`/lecture/${response.data.lecture.id}`)
        } catch {
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
                        {sentences.length === 0 && isStreaming && (
                            <span className="text-gray-400">Generating lecture...</span>
                        )}
                        {sentences.map((sentence, index) => (
                            <span
                                key={index}
                                className={`${
                                    index === currentSentenceIndex
                                        ? 'bg-emerald-100 text-emerald-900 font-medium'
                                        : index < currentSentenceIndex
                                        ? 'text-gray-500'
                                        : 'text-gray-700'
                                } transition-colors duration-200`}
                            >
                                {sentence}{' '}
                            </span>
                        ))}
                        {isStreaming && (
                            <span className="inline-block w-2 h-5 bg-emerald-700 animate-pulse ml-1"></span>
                        )}
                    </div>
                </div>

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
                    </div>
                )}

                {/* Currently streaming answer */}
                {isAsking && answerSentences.length > 0 && (
                    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Answering...</p>
                        <div className="text-sm leading-relaxed">
                            {answerSentences.map((sentence, index) => (
                                <span
                                    key={index}
                                    className={`${
                                        index === currentAnswerIndex
                                            ? 'bg-emerald-200 text-emerald-900 font-medium'
                                            : 'text-gray-700'
                                    } transition-colors duration-200`}
                                >
                                    {sentence}{' '}
                                </span>
                            ))}
                            <span className="inline-block w-2 h-4 bg-emerald-700 animate-pulse ml-1"></span>
                        </div>
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