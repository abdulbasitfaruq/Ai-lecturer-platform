function LecturerAvatar({ lecturer, isSpeaking, large = false }) {
    const glowMap = {
        emerald: "shadow-emerald-400",
        blue: "shadow-blue-400",
        purple: "shadow-purple-400",
        green: "shadow-green-400",
        amber: "shadow-amber-400"
    }

    const ringMap = {
        emerald: "ring-emerald-400",
        blue: "ring-blue-400",
        purple: "ring-purple-400",
        green: "ring-green-400",
        amber: "ring-amber-400"
    }

    const glow = glowMap[lecturer.color] || glowMap.emerald
    const ring = ringMap[lecturer.color] || ringMap.emerald

    const size = large ? 'w-24 h-24' : 'w-14 h-14'
    const textSize = large ? 'text-2xl' : 'text-lg'

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                {/* Avatar Image or Initials */}
                <div
                    className={`${size} rounded-full overflow-hidden border-2 ${
                        isSpeaking
                            ? `ring-4 ${ring} shadow-lg ${glow} scale-105`
                            : 'border-gray-200'
                    } transition-all duration-300`}
                >
                    {lecturer.image ? (
                        <img
                            src={lecturer.image}
                            alt={lecturer.name}
                            className={`w-full h-full object-cover ${
                                isSpeaking ? 'animate-pulse-subtle' : ''
                            }`}
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${textSize} font-bold text-gray-400`}>
                            {lecturer.initials}
                        </div>
                    )}
                </div>

                {/* Audio wave bars when speaking */}
                {isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <div className="flex gap-0.5 items-end">
                            <div className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDuration: '0.4s'}}></div>
                            <div className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce" style={{animationDuration: '0.3s'}}></div>
                            <div className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDuration: '0.5s'}}></div>
                        </div>
                    </div>
                )}

                {/* Live indicator */}
                {isSpeaking && (
                    <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                )}
            </div>

            {/* Lecturer info */}
            <div>
                <h3 className="font-semibold text-gray-900 text-sm">{lecturer.name}</h3>
                <p className="text-xs text-gray-500">{lecturer.title}</p>
                {isSpeaking && (
                    <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Speaking...
                    </p>
                )}
            </div>
        </div>
    )
}

export default LecturerAvatar