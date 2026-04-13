from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.storage import upload_document
from app.services.rag import index_document
import PyPDF2
import io

router = APIRouter(prefix="/documents", tags=["documents"])

class PasteRequest(BaseModel):
    text: str
    doc_type: str

@router.post("/upload/{doc_type}")
async def upload(doc_type: str, file: UploadFile = File(...)):
    if doc_type not in ["resume", "job_description"]:
        raise HTTPException(status_code=400, detail="doc_type must be resume or job_description")

    content = await file.read()

    if file.filename.endswith(".pdf"):
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
        except Exception:
            raise HTTPException(status_code=400, detail="Could not read PDF file.")
    else:
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="File must be .txt or .pdf")

    upload_document(content, file.filename, doc_type)
    index_document(doc_type, text)

    return {"message": f"{doc_type} uploaded successfully", "filename": file.filename}

@router.post("/paste")
async def paste(request: PasteRequest):
    if request.doc_type not in ["resume", "job_description"]:
        raise HTTPException(status_code=400, detail="doc_type must be resume or job_description")
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    index_document(request.doc_type, request.text)
    return {"message": f"{request.doc_type} pasted and indexed successfully"}
