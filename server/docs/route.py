from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from .vectorstore import load_vectorstore
import uuid

router = APIRouter()

@router.post("/upload_docs")
async def upload_docs(
    file: UploadFile = File(...),
    grade: int = Form(...),
):
    """
    Upload PDF documents and index them into:
    - Supabase
    - Pinecone
    Access is public by default
    """

    # Validate all files
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=f"{file.filename} is not a PDF file."
        )

    doc_id = str(uuid.uuid4())
    ACCESS_ROLE = "Public"

    try:
        await load_vectorstore(
            uploaded_files=[file],
            role=ACCESS_ROLE,
            doc_id=doc_id,
            grade=grade
        )

    except Exception as e:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    return {
        "message": "Files uploaded and indexed successfully.",
        "doc_id": doc_id,
        "grade": grade,
        "access": ACCESS_ROLE
    }