from resume_parser import extract_text_from_pdf
from chunker import chunk_text
from embedder import create_embedding
from vector_store import VectorStore
from chatbot import generate_answer
import os


PDF_PATH  = r"D:\ai_resume_assistant\data\vaishali_13_07.pdf"


# 1. Extract resume
text = extract_text_from_pdf(PDF_PATH)

print("Resume extracted")


# 2. Create chunks
chunks = chunk_text(text)

print(f"Created {len(chunks)} chunks")


# 3. Create embeddings
embeddings = []

for i, chunk in enumerate(chunks):

    print(f"Embedding chunk {i + 1}/{len(chunks)}")

    embedding = create_embedding(chunk)

    embeddings.append(embedding)


# 4. Create FAISS store
dimension = len(embeddings[0])

store = VectorStore(dimension)

store.add(
    embeddings,
    chunks
)
os.makedirs("../index", exist_ok=True)

store.save(
    r"../index/resume.index",
    r"../index/chunks.pkl"
)

print("Index saved successfully")

print("Index saved successfully")
print("FAISS index created")


# -------------------------
# 5. Ask question
# -------------------------

while True:

    question = input("\nRecruiter: ")

    if question.lower() == "exit":
        break

    # Create query embedding
    query_embedding = create_embedding(question)

    # Retrieve relevant chunks
    results = store.search(
        query_embedding,
        k=3
    )

    # Generate answer
    answer = generate_answer(
        question,
        results
    )

    print("\nAI Resume Assistant:")
    print(answer)