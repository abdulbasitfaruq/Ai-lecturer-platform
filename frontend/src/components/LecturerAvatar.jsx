function LecturerAvatar({ lecturer, isSpeaking }) {
    const colorMap = {
        emerald: "bg-emerald-100 text-emerald-700 border-emerald-300",
        blue: "bg-blue-100 text-blue-700 border-blue-300",
        purple: "bg-purple-100 text-purple-700 border-purple-300",
        green: "bg-green-100 text-green-700 border-green-300",
        amber: "bg-amber-100 text-amber-700 border-amber-300"
    }

    const glowMap = {
        emerald: "shadow-emerald-300",
        blue: "shadow-blue-300",
        purple: "shadow-purple-300",
        green: "shadow-green-300",
        amber: "shadow-amber-300"
    }

    const colors = colorMap[lecturer.color] || colorMap.emerald
    const glow = glowMap[lecturer.color] || glowMap.emerald

    return (
        <div className="flex items-center gap-4 mb-4">
            <div className={`relative`}>
                <div
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-bold ${colors} ${
                        isSpeaking ? `shadow-lg ${glow} scale-105` : ''
                    } transition-all duration-300`}
                >
                    {lecturer.initials}
                </div>
                {isSpeaking && (
                    <div className="absolute -bottom-1 -right-1">
                        <div className="flex gap-0.5 items-end">
                            <div className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 text-sm">{lecturer.name}</h3>
                <p className="text-xs text-gray-500">{lecturer.title}</p>
                {isSpeaking && (
                    <p className="text-xs text-emerald-600 mt-0.5">Speaking...</p>
                )}
            </div>
        </div>
    )
}

export default LecturerAvatar