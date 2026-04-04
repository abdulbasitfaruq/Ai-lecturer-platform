import axios from "axios";

const API = axios.create({
    baseURL: 'http://localhost:5000'
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
        email: username + '@placeholder.com', 
        password
    });
}


export const generateLecture = (topic, subject, difficulty, userID) => {
    return API.post('/Lecture/generate', {
        topic,
        subject,
        difficulty,
        user_ID: userID
    });
}


export const generateGuestLecture = (topic, subject, difficulty) => {
    return API.post('/Lecture/generateGuest', {
        topic,
        subject,
        difficulty
    });
}

export const getUserLectures = (userID) => {
    return API.get(`/Lecture/user/${userID}`);
}

export const askQuestion = (lectureId, userId, question) => {
    return API.post('/qa/ask', {
        lecture_id: lectureId,
        user_id: userId,
        question: question
    });
}

export const getLectureQuestion = (lectureId) => {
    return API.get(`/qa/lecture/${lectureId}/questions`);
}


