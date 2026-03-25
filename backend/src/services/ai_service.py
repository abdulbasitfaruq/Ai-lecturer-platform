from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_lecture(topic: str, difficulty: str = "intermediate") -> dict:
    prompt = f"""
    You are expert university lecturer.Generate a detailed educational lecture.
    Topic: {topic}
    Difficulty Level: {difficulty}
    
    Structure of the lecture as follows:
    1. Introduction: Briefly introduce the topic and its importance.
    2. Main Content: Provide a comprehensive explanation of the topic, including key concepts.
    3. Examples: Include relevant examples to illustrate the concepts.
    4. Conclusion: Summarize the main points and provide any final thoughts.
    
    Make it engaging and informative, suitable for students at the {difficulty} level. Use clear language and avoid jargon. Include any relevant historical context, applications, or future implications of the topic.
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
            "topic": topic
        }
    except Exception as e:
        raise Exception(f"Error generating lecture content: {str(e)}")
    