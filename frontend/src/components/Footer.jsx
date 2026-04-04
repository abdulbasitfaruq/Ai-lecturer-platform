function Footer() {
    return (
        <footer className="bg-emerald-900 px-7 py-5 flex justify-between items-center">
            <p className="text-sm text-emerald-300">
                AI Lecturer Platform &copy; 2026
            </p>
            <div className="flex gap-5">
                <span className="text-sm text-emerald-300 cursor-pointer hover:text-white">
                    Privacy
                </span>
                <span className="text-sm text-emerald-300 cursor-pointer hover:text-white">
                    Terms
                </span>
                <span className="text-sm text-emerald-300 cursor-pointer hover:text-white">
                    Contact
                </span>
            </div>
        </footer>
    )
}

export default Footer