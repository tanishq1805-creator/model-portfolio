import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.services.storage import get_storage

router = APIRouter(prefix="/upload", tags=["Upload"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".pdf"}

@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    subfolder: str = Form("portfolio"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Sanitize subfolder
    safe_folder = "media"
    if subfolder in ["profiles", "covers", "portfolio", "verification", "campaigns"]:
        safe_folder = subfolder

    storage = get_storage()
    url = await storage.upload(file, subfolder=safe_folder)

    return {
        "url": url,
        "filename": file.filename,
        "media_type": "video" if ext in {".mp4", ".mov"} else "image",
    }
