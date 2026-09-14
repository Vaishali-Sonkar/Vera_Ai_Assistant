import smtplib

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from embedder import create_embedding
from vector_store import VectorStore
from chatbot import generate_answer, stream_answer
from schemas import ContactRequest, FeedbackRequest
from email_service import EmailConfigurationError, send_contact_email
from sheets_service import save_feedback
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Resume Assistant",
    description="AI chatbot that answers recruiter questions using the candidate's resume."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load FAISS index when the API starts
store = VectorStore.load(
    index_path="index/resume.index",
    chunks_path="index/chunks.pkl"
)


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=2,
        max_length=500
    )


@app.get("/")
def root():
    return {
        "message": "AI Resume Assistant API is running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    # 1. Convert recruiter question into embedding
    query_embedding = create_embedding(
        request.question
    )

    # 2. Find relevant resume chunks
    relevant_chunks = store.search(
        query_embedding,
        k=3
    )

    # 3. Generate answer using Gemini
    answer = generate_answer(
        request.question,
        relevant_chunks
    )

    return {
        "question": request.question,
        "answer": answer
    }


@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    query_embedding = create_embedding(request.question)
    relevant_chunks = store.search(query_embedding, k=3)
    return StreamingResponse(
        stream_answer(request.question, relevant_chunks),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff"}
    )


@app.post("/feedback")
def submit_feedback(data: FeedbackRequest):

    save_feedback(
        name=data.name,
        email=data.email,
        feedback=data.feedback,
        rating=data.rating
    )

    return {
        "success": True,
        "message": "Feedback submitted successfully"
    }


@app.post("/contact")
def submit_contact(data: ContactRequest):
    try:
        send_contact_email(data)
    except EmailConfigurationError as exc:
        raise HTTPException(
            status_code=503,
            detail="Email service is not configured. Please try again later."
        ) from exc
    except (smtplib.SMTPException, OSError) as exc:
        raise HTTPException(
            status_code=502,
            detail="The message could not be sent. Please try again."
        ) from exc

    return {
        "success": True,
        "message": "Message sent successfully! I'll get back to you soon."
    }
