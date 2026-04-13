from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag import query_documents

router = APIRouter(prefix="/chat", tags=["chat"])

class QuestionRequest(BaseModel):
    question: str

@router.post("/ask")
def ask(request: QuestionRequest):
    answer = query_documents(request.question, ["resume", "job_description"])
    return {
        "question": request.question,
        "answer": answer
    }
