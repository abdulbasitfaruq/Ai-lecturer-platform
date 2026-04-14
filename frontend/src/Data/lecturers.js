const lecturers = {
    "Computer Science": {
        name: "Dr. Sarah Chen",
        title: "Computer Science Lecturer",
        bio: "PhD in Artificial Intelligence, 10 years teaching experience",
        color: "emerald",
        initials: "SC",
        voice: "nova"
    },
    "Physics": {
        name: "Prof. James Obi",
        title: "Physics Lecturer",
        bio: "PhD in Quantum Mechanics, former CERN researcher",
        color: "blue",
        initials: "JO",
        voice: "onyx"
    },
    "Mathematics": {
        name: "Dr. Maria Santos",
        title: "Mathematics Lecturer",
        bio: "PhD in Applied Mathematics, published 30+ papers",
        color: "purple",
        initials: "MS",
        voice: "shimmer"
    },
    "Biology": {
        name: "Dr. Aisha Patel",
        title: "Biology Lecturer",
        bio: "PhD in Molecular Biology, genetics research lead",
        color: "green",
        initials: "AP",
        voice: "nova"
    },
    "Chemistry": {
        name: "Prof. David Kim",
        title: "Chemistry Lecturer",
        bio: "PhD in Organic Chemistry, 15 years teaching experience",
        color: "amber",
        initials: "DK",
        voice: "echo"
    },
    "default": {
        name: "Dr. Alex Morgan",
        title: "AI Lecturer",
        bio: "Expert across multiple disciplines",
        color: "emerald",
        initials: "AM",
        voice: "onyx"
    }
}

export const getLecturer = (subject) => {
    return lecturers[subject] || lecturers["default"]
}

export default lecturers