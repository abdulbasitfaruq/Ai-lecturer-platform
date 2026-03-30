from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_lecture(topic: str, subject: str, difficulty: str = "intermediate") -> dict:
    prompt = f"""
    You are expert university lecturer in {subject}.Generate a detailed educational lecture.
    Topic: {topic}
    Subject: {subject}
    Difficulty Level: {difficulty}
    
    Structure of the lecture as follows:
    1. Introduction: Briefly introduce the topic and its importance.
    2. Main Content: Provide a comprehensive explanation of the topic, including key concepts.
    3. Examples: Include relevant examples to illustrate the concepts.
    4. Conclusion: Summarize the main points and provide any final thoughts.
    
    Make it engaging and informative, suitable for students at the {difficulty} level. Use clear language and avoid jargon. Include any relevant historical context, applications, or future implications of the topic.
    Make sure the lecture is specifically about {topic} in the context of {subject}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "You are an expert university lecturer."},
                {"role": "user", "content": prompt}
            ],
        )
        lecture_content = response.choices[0].message.content

        summary_response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "user", "content": f"Summarize:{lecture_content}"}
            ]
        )
        lecture_summary = summary_response.choices[0].message.content
        return {
            "content": lecture_content,
            "summary": lecture_summary,
            "difficulty": difficulty,
            "topic": topic,
            "subject": subject
        }
    except Exception as e:
        raise Exception(f"Error generating lecture content: {str(e)}")
    
def answer_question(lecture_content: str, question: str) -> str:
    prompt = f"""
    You are an expert university lecturer. A student has asked a question about your lecture. Answer based on the lecture content provided.
    
    Lecture Content: {lecture_content}
    Student's Question: {question}
    
    Provide a clear, helpful answer based on the lecture.
    If the question is not related to the lecture, politely
    let the student know and try to help anyway.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "You are an expert university lecturer."},
                {"role": "user", "content": prompt}
            ],
        )
        answer = response.choices[0].message.content
        return answer
    except Exception as e:
        raise Exception(f"Error answering question: {str(e)}")
    