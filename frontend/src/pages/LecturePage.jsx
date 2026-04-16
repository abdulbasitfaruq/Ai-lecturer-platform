import { useState, useEffect, useRef } from 'react' // Added useRef
import { useParams, Link } from 'react-router-dom'
import { getUserLectures, askQuestion, getLectureQuestion, getAudioUrl } from '../services/api' // Added getAudioUrl
import LecturerAvatar from '../components/LecturerAvatar'
import { getLecturer } from '../Data/lecturers'

function LecturePage() {
    const { id } = useParams()
    const [lecture, setLecture] = useState(null)
    const [questions, setQuestions] = useState([])
    const [newQuestion, setNewQuestion] = useState('')
    const [loading, setLoading] = useState(true)
    const [asking, setAsking] = useState(false)
    const [error, setError] = useState('')

    // Sync States
    const [currentWordIndex, setCurrentWordIndex] = useState(-1)
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef(null)
    const textContainerRef = useRef(null)

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
    }, [id, user.id])

    // --- SYNC LOGIC ---
    const playLectureAudio = () => {
        if (!lecture?.audio_file || isPlaying) return;

        const audio = new Audio(getAudioUrl(lecture.audio_file));
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            const totalDuration = audio.duration;
            const words = lecture.content.split(/\s+/);
            
            const estimatedTimestamps = words.map((word, i) => ({
                start: (i / words.length) * totalDuration,
                end: ((i + 1) / words.length) * totalDuration,
            }));

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

    const toggleAudio = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            if (audioRef.current) {
                audioRef.current.play();
            } else {
                playLectureAudio();
            }
        }
    };

    const renderWords = () => {
        if (!lecture) return null;
        const words = lecture.content.split(/\s+/);
        return words.map((word, index) => (
            <span key={index} className={`${index === currentWordIndex ? 'bg-emerald-200 text-emerald-900 font-medium' : index < currentWordIndex ? 'text-gray-400' : 'text-gray-700'} transition-colors duration-100`}>
                {word}{' '}
            </span>
        ));
    };
    // ------------------

    const handleAsk = async () => {
        if (!newQuestion.trim()) return
        setAsking(true)
        try {
            const response = await askQuestion(parseInt(id), user.id, newQuestion)
            setQuestions([...questions, response.data.question])
            setNewQuestion('')
        } catch (err) {
            setError('Failed to ask question')
        } finally {
            setAsking(false)
        }
    }

    if (loading || !lecture) return <div className="p-10 text-center">Loading...</div>

    const lecturer = getLecturer(lecture.subject)

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 mb-4 block">
                    ← Back to dashboard
                </Link>

                {/* Main Lecture Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-4">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{lecture.topic}</h1>
                            <p className="text-gray-500">{lecture.subject}</p>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase font-bold">
                            {lecture.difficulty}
                        </span>
                    </div>

                    {/* Sync Content Area */}
                    <div className="bg-white rounded-xl mb-6 min-h-[200px] text-lg leading-relaxed" ref={textContainerRef}>
                        {currentWordIndex >= 0 ? renderWords() : lecture.content}
                    </div>

                    {lecture.summary && (
                        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                            <h3 className="text-xs font-bold text-emerald-800 uppercase mb-1">Summary</h3>
                            <p className="text-sm text-emerald-700">{lecture.summary}</p>
                        </div>
                    )}
                </div>

                {/* Lecturer & Audio Control */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 flex items-center justify-between">
                    <LecturerAvatar lecturer={lecturer} isSpeaking={isPlaying} large={true} />
                    {lecture.audio_file && (
                        <button 
                            onClick={toggleAudio}
                            className="w-14 h-14 bg-emerald-700 text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-emerald-800 transition-all"
                        >
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                    )}
                </div>

                {/* Q&A Section stays the same... */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Lecture Q&A</h3>
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-700"
                            placeholder="Type your question here..."
                        />
                        <button onClick={handleAsk} disabled={asking} className="bg-emerald-700 text-white px-5 rounded-lg text-sm font-semibold">
                            {asking ? '...' : 'Ask'}
                        </button>
                    </div>

                    {questions.map((q, index) => (
                        <div key={index} className="py-4 border-b border-gray-100 last:border-0">
                            <p className="text-sm font-bold text-gray-900 mb-1">Q: {q.question}</p>
                            <p className="text-sm text-gray-600 pl-4 border-l-2 border-emerald-500">{q.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LecturePage