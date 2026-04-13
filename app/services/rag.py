import os
import faiss
import numpy as np
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
indexes = {}
chunk_stores = {}
DIM = 384

def simple_embedding(text):
    vec = np.zeros(DIM, dtype="float32")
    for word in text.lower().split():
        vec[hash(word) % DIM] += 1.0
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec

def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunks.append(" ".join(words[i:i+chunk_size]))
        i += chunk_size - overlap
    return chunks

def index_document(doc_id, text):
    chunks = chunk_text(text)
    embeddings = np.array([simple_embedding(c) for c in chunks])
    index = faiss.IndexFlatL2(DIM)
    index.add(embeddings)
    indexes[doc_id] = index
    chunk_stores[doc_id] = chunks

def query_documents(question, doc_ids, top_k=3):
    q_vec = simple_embedding(question).reshape(1, -1)
    all_chunks = []
    for doc_id in doc_ids:
        if doc_id not in indexes:
            continue
        _, indices = indexes[doc_id].search(q_vec, top_k)
        for idx in indices[0]:
            if idx < len(chunk_stores[doc_id]):
                all_chunks.append(chunk_stores[doc_id][idx])
    if not all_chunks:
        return "No relevant content found. Please upload your resume and job description first."
    context = "\n\n".join(all_chunks)
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are JobLens. Answer questions based only on the provided context."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content
