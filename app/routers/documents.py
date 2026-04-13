from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.storage import upload_document
from app.services.rag import index_document
import io

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload/{doc_type}")
async def upload(doc_type: str, file: UploadFile = File(...)):
    if doc_type not in ["resume", "job_description"]:
        raise HTTPException(status_code=400, detail="doc_type must be resume or job_description")
    
    content = await file.read()
    
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be plain text (.txt). PDF support coming soon.")
    
    s3_key = upload_document(content, file.filename, doc_type)
    index_document(doc_type, text)
    
    return {
        "message": f"{doc_type} uploaded and indexed successfully",
        "filename": file.filename,
        "s3_key": s3_key
    }
