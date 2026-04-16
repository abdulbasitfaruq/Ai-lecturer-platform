import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getAudioUrl, streamLecture, streamQuestion, saveLecture } from '../services/api'
import LecturerAvatar from '../components/LecturerAvatar'
import { getLecturer } from '../Data/lecturers'

function LiveLecturePage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const topic = searchParams.get('topic')
    const subject = searchParams.get('subject')
    const difficulty = searchParams.get('difficulty') || 'intermediate'
    const voice = searchParams.get('voice') || 'onyx'

    // State
    const [lectureText, setLectureText] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [audioFile, setAudioFile] = useState(null)
    const [generatingAudio, setGeneratingAudio] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentWordIndex, setCurrentWordIndex] = useState(-1)
    
    // Q&A State
    const [question, setQuestion] = useState('')
    const [isAsking, setIsAsking] = useState(false)
    const [answerText, setAnswerText] = useState('')
    const [currentAnswerWordIndex, setCurrentAnswerWordIndex] = useState(-1)
    const [isAnswerPlaying, setIsAnswerPlaying] = useState(false)
    const [qaPairs, setQaPairs] = useState([])
    
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // Refs for audio and streaming
    const audioRef = useRef(null)
    const answerAudioRef = useRef(null)
    const fullContentRef = useRef('')
    const textContainerRef = useRef(null)
    const hasStartedRef = useRef(false)

    const user = JSON.parse(localStorage.getItem('user'))
    const lecturer = getLecturer(subject)

    // Auto-scroll logic
    useEffect(() => {
        if (textContainerRef.current) {
            textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight
        }
    }, [lectureText, answerText])

    // Start streaming ONLY ONCE on load
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
                                // FIX: data is an object, we need the filename string
                                setAudioFile(data.filename)
                                setGeneratingAudio(false)
                            } else if (data.type === 'done') {
                                setIsStreaming(false)
                                setGeneratingAudio(true)
                            }
                        } catch (e) { console.error("Parse error", e) }
                    }
                }
            }
        } catch (err) {
            setError('Failed to stream lecture')
            setIsStreaming(false)
        }
    }

    useEffect(() => {
        if (topic && subject) startStreaming()
    }, [])

    useEffect(() => {
        if (audioFile) {
            setGeneratingAudio(false)
            setIsFinished(true)
        }
    }, [audioFile])

    // Play main lecture audio with sync
    const playLectureAudio = () => {
        if (!audioFile || !lectureText) return;

        const audio = new Audio(getAudioUrl(audioFile));
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            const totalDuration = audio.duration;
            const words = lectureText.split(/\s+/);
            
            const estimatedTimestamps = words.map((word, i) => {
                const start = (i / words.length) * totalDuration;
                const end = ((i + 1) / words.length) * totalDuration;
                return { word, start, end };
            });

            audio.ontimeupdate = () => {
                const index = estimatedTimestamps.findIndex(
                    w => audio.currentTime >= w.start && audio.currentTime <= w.end
                );
                if (index !== -1) setCurrentWordIndex(index);
            };
        };

        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => {
            setIsPlaying(false);
            setCurrentWordIndex(-1);
        };
        audio.play().catch(console.error);
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) return
        if (audioRef.current) audioRef.current.pause()

        setIsAsking(true)
        setAnswerText('')
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
                                // FIX: Extract filename from data object
                                const filename = data.filename;
                                const ansAudio = new Audio(getAudioUrl(filename))
                                answerAudioRef.current = ansAudio

                                ansAudio.onloadedmetadata = () => {
                                    const totalDuration = ansAudio.duration;
                                    const words = fullAnswer.split(/\s+/);
                                    const timestamps = words.map((word, i) => ({
                                        start: (i / words.length) * totalDuration,
                                        end: ((i + 1) / words.length) * totalDuration
                                    }));

                                    ansAudio.ontimeupdate = () => {
                                        const idx = timestamps.findIndex(t => ansAudio.currentTime >= t.start && ansAudio.currentTime <= t.end);
                                        if (idx !== -1) setCurrentAnswerWordIndex(idx);
                                    };
                                    ansAudio.play();
                                };

                                ansAudio.onplay = () => setIsAnswerPlaying(true);
                                ansAudio.onended = () => {
                                    setIsAnswerPlaying(false);
                                    setCurrentAnswerWordIndex(-1);
                                    setQaPairs(prev => [...prev, { question: currentQuestion, answer: fullAnswer }]);
                                    setIsAsking(false);
                                };
                            }
                        } catch (e) {}
                    }
                }
            }
        } catch (err) {
            setError('Failed to answer question')
            setIsAsking(false)
        }
    }

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        try {
            const response = await saveLecture(topic, subject, difficulty, fullContentRef.current, user.id, audioFile)
            navigate(`/lecture/${response.data.lecture.id}`)
        } catch (err) {
            setError('Failed to save lecture')
            setSaving(false)
        }
    }

    const renderWords = (text, currentIndex) => {
        const words = text.split(/\s+/)
        return words.map((word, index) => (
            <span key={index} className={`${index === currentIndex ? 'bg-emerald-200 text-emerald-900 font-medium' : index < currentIndex ? 'text-gray-400' : 'text-gray-700'} transition-colors duration-100`}>
                {word}{' '}
            </span>
        ))
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-emerald-700 px-7 py-4 flex justify-between items-center text-white sticky top-0 z-10">
                <div>
                    <h1 className="text-lg font-bold">{topic}</h1>
                    <p className="text-emerald-200 text-sm">{subject} · {difficulty}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isStreaming && <span className="text-sm animate-pulse text-red-300">● Live Streaming</span>}
                    {isFinished && (
                        <button onClick={handleSave} disabled={saving} className="bg-white text-emerald-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-50">
                            {saving ? 'Saving...' : 'Save to dashboard'}
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-6 px-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

                {/* Lecturer Box */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex items-center justify-between">
                    <LecturerAvatar lecturer={lecturer} isSpeaking={isPlaying || isAnswerPlaying} large={true} />
                    {audioFile && isFinished && !isAsking && (
                        <button onClick={isPlaying ? () => audioRef.current?.pause() : playLectureAudio} className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xl">
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                    )}
                </div>

                {/* Main Text Content */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 min-h-[200px] max-h-[400px] overflow-y-auto" ref={textContainerRef}>
                    {!lectureText && isStreaming ? <p className="text-gray-400">Dr. Patel is starting the lecture...</p> : null}
                    {currentWordIndex >= 0 ? renderWords(lectureText, currentWordIndex) : <p className="text-gray-700 whitespace-pre-line">{lectureText}</p>}
                </div>

                {/* Q&A Input */}
                {!isAsking && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex gap-2">
                        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskQuestion()} className="flex-1 border-none focus:ring-0 text-sm" placeholder="Ask Dr. Patel a question..." />
                        <button onClick={handleAskQuestion} disabled={!question.trim()} className="bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:bg-gray-300">Ask</button>
                    </div>
                )}

                {/* Answer Box */}
                {isAsking && (
                    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 mb-4">
                        <p className="text-sm font-bold text-emerald-900 mb-2">Dr. Patel's Answer:</p>
                        <div className="text-gray-800 text-base leading-relaxed">
                            {currentAnswerWordIndex >= 0 ? renderWords(answerText, currentAnswerWordIndex) : answerText}
                        </div>
                    </div>
                )}

                {/* Q&A History */}
                <div className="space-y-4">
                    {qaPairs.map((qa, i) => (
                        <div key={i} className="border-l-4 border-emerald-500 pl-4 py-2">
                            <p className="text-xs font-bold text-gray-400 uppercase">Question</p>
                            <p className="text-sm font-semibold text-gray-900 mb-2">{qa.question}</p>
                            <p className="text-sm text-gray-600">{qa.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LiveLecturePage