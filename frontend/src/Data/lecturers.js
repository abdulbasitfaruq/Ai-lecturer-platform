import sarahChen from '../assets/lecturers/Sarah_chen.png'
import jamesObi from '../assets/lecturers/james_obi.jpeg'
import mariaSantos from '../assets/lecturers/maria_santos.jpeg'
import aishaPatel from '../assets/lecturers/aisha_patel.jpeg'
import davidKim from '../assets/lecturers/david_kim.jpeg'
import alexMorgan from '../assets/lecturers/alex_morgan.jpeg'

const lecturers = {
    "Computer Science": {
        name: "Dr. Sarah Chen",
        title: "Computer Science Lecturer",
        bio: "PhD in Artificial Intelligence, 10 years teaching experience",
        color: "emerald",
        initials: "SC",
        voice: "nova",
        image: sarahChen
    },
    "Physics": {
        name: "Prof. James Obi",
        title: "Physics Lecturer",
        bio: "PhD in Quantum Mechanics, former CERN researcher",
        color: "blue",
        initials: "JO",
        voice: "onyx",
        image: jamesObi
    },
    "Mathematics": {
        name: "Dr. Maria Santos",
        title: "Mathematics Lecturer",
        bio: "PhD in Applied Mathematics, published 30+ papers",
        color: "purple",
        initials: "MS",
        voice: "shimmer",
        image: mariaSantos
    },
    "Biology": {
        name: "Dr. Aisha Patel",
        title: "Biology Lecturer",
        bio: "PhD in Molecular Biology, genetics research lead",
        color: "green",
        initials: "AP",
        voice: "nova",
        image: aishaPatel
    },
    "Chemistry": {
        name: "Prof. David Kim",
        title: "Chemistry Lecturer",
        bio: "PhD in Organic Chemistry, 15 years teaching experience",
        color: "amber",
        initials: "DK",
        voice: "echo",
        image: davidKim
    },
    "default": {
        name: "Dr. Alex Morgan",
        title: "AI Lecturer",
        bio: "Expert across multiple disciplines",
        color: "emerald",
        initials: "AM",
        voice: "onyx",
        image: alexMorgan
    }
}

export const getLecturer = (subject) => {
    if (!subject) return lecturers["default"]
    
    const match = Object.keys(lecturers).find(
        key => key.toLowerCase() === subject.toLowerCase()
    )
    return match ? lecturers[match] : lecturers["default"]
}

export default lecturers