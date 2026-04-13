import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

model = SentenceTransformer("all-MiniLM-L6-v2")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

indexes = {}
chunk_stores = {}

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def index_document(doc_id: str, text: str):
    chunks = chunk_text(text)
    embeddings = model.encode(chunks)
    embeddings = np.array(embeddings).astype("float32")
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    indexes[doc_id] = index
    chunk_stores[doc_id] = chunks

def query_documents(question: str, doc_ids: list, top_k: int = 3) -> str:
    question_embedding = model.encode([question])
    question_embedding = np.array(question_embedding).astype("float32")

    all_chunks = []
    for doc_id in doc_ids:
        if doc_id not in indexes:
            continue
        distances, indices = indexes[doc_id].search(question_embedding, top_k)
        for idx in indices[0]:
            if idx < len(chunk_stores[doc_id]):
                all_chunks.append(chunk_stores[doc_id][idx])

    if not all_chunks:
        return "No relevant content found. Please upload your resume and job description first."

    context = "\n\n".join(all_chunks)

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are JobLens, an AI assistant that helps people with job applications. Answer questions based only on the provided context from their resume and job description."
            },
            {
                "role": "user",
                "content": f"Context from documents:\n{context}\n\nQuestion: {question}"
            }
        ]
    )

    return response.choices[0].message.content
