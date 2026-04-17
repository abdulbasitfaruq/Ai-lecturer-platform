function Footer() {
    return (
        <footer className="bg-emerald-900 px-7 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                            <span className="text-emerald-400">AI</span> Lecturer
                        </h3>
                        <p className="text-xs text-emerald-400 max-w-xs leading-relaxed">
                            An AI-powered lecture platform that delivers live, interactive university lectures with voice, visuals, and real-time Q&A.
                        </p>
                    </div>
                    <div className="flex gap-8">
    
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-300 uppercase mb-2">Powered by</p>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm text-emerald-400">OpenAI GPT</span>
                                <span className="text-sm text-emerald-400">Google Gemini</span>
                                <span className="text-sm text-emerald-400">OpenAI TTS</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-emerald-800 pt-4 flex justify-between items-center">
                    <p className="text-xs text-emerald-500">
                        AI Lecturer Platform &copy; 2026 — Built by AbdulBasit Farooq
                    </p>
                    <p className="text-xs text-emerald-600">
                        Final Year Project — Computer Science
                    </p>
                </div>
        </footer>
    )
}

export default Footer