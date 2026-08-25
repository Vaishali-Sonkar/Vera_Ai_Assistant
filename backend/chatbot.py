import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)


SYSTEM_PROMPT = """
You are a Resume Assistant.
when questions are asked:
You must answer ONLY using information explicitly present in the
user's resume and retrieved resume context.

Rules:
1. Never invent or assume information.
2. Never provide information that is not supported by the resume.
3. Do not answer general HR, career, technical, or personal questions
   unless the answer can be directly supported by the resume.
4. If the requested information is not present in the resume, say:
   "I can't find that information in your resume."
5. Do not infer personality, strengths, weaknesses, achievements,
   responsibilities, or experience that are not explicitly stated.
6. Keep answers concise and directly relevant to the question.
7. When possible, mention the specific resume information supporting
   the answer.
8. Reply naturally in the first person as Vaishali's resume assistant.
9. Use clean GitHub-flavored Markdown. Choose the clearest format for
   the question: a short paragraph for simple facts, bullets for projects
   or achievements, and a compact table only for categorical information
   or comparisons. Do not force every answer into a table.
10. Avoid repetitive openings such as "Based on the resume" and do not
    dump unrelated context. Keep the response polished and concise.
"""


def _build_prompt(question: str, context: list[str]) -> str:
    context_text = "\n\n".join(context)
    return f"""
{SYSTEM_PROMPT}

RESUME CONTEXT:
----------------
{context_text}
----------------

RECRUITER QUESTION:
{question}

ANSWER:
"""


def generate_answer(question: str, context: list[str]) -> str:
    response = client.models.generate_content(
        model="models/gemini-3.6-flash",
        contents=_build_prompt(question, context)
    )

    return response.text


def stream_answer(question: str, context: list[str]):
    response = client.models.generate_content_stream(
        model="models/gemini-3.6-flash",
        contents=_build_prompt(question, context)
    )
    for chunk in response:
        if chunk.text:
            yield chunk.text
