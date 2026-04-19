import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

export const registerUser = (username, email, password) => {
    return API.post('/auth/register', 
        { username, 
          email, 
          password });
}

export const loginUser = (username, password) => {
    return API.post('/auth/login', {
        username,
        password
    });
}


export const generateLecture = (topic, subject, difficulty, userID, voice = 'onyx') => {
    return API.post('/lectures/generate', {
        topic,
        subject,
        difficulty,
        user_id: userID,
        voice: voice
    });
}


export const generateGuestLecture = (topic, subject, difficulty) => {
    return API.post('/lectures/guest/generate', {
        topic,
        subject,
        difficulty
    });
}

export const getUserLectures = (userID) => {
    return API.get(`/lectures/user/${userID}`);
}

export const askQuestion = (lectureId, userId, question_text) => {
    return API.post('/qa/ask', {
        lecture_id: lectureId,
        user_id: userId,
        question_text : question_text
    });
}

export const getLectureQuestion = (lectureId) => {
    return API.get(`/qa/lectures/${lectureId}/questions`);
}

export const getAudioUrl = (filename) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${base}/audio/${filename}`
}

export const streamLecture = (topic, subject, difficulty, voice = 'onyx') => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return fetch(`${base}/lectures/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subject, difficulty, voice })
    })
}

export const streamQuestion = (lectureContent, question, voice = 'onyx') => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return fetch(`${base}/lectures/stream/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecture_content: lectureContent, question, voice })
    })
}

export const saveLecture = (topic, subject, difficulty, content, userId, audioFile, visualUrl = null) => {
    return API.post('/lectures/save', {
        topic,
        subject,
        difficulty,
        content,
        user_id: userId,
        audio_file: audioFile,
        visual_url: visualUrl
    })
}


