import os
import uuid
import shutil
from abc import ABC, abstractmethod
from typing import Optional
from fastapi import UploadFile
from app.config import settings

class StorageProvider(ABC):
    @abstractmethod
    async def upload(self, file: UploadFile, subfolder: str = "media") -> str:
        """Upload a file and return the public access URL."""
        pass

    @abstractmethod
    async def delete(self, file_path_or_url: str) -> bool:
        """Delete a file by its URL or path."""
        pass


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    async def upload(self, file: UploadFile, subfolder: str = "media") -> str:
        target_dir = os.path.join(self.base_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)

        # Generate unique safe filename
        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext.lower()}"
        file_path = os.path.join(target_dir, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return standard public URL served by static route
        return f"/uploads/{subfolder}/{unique_name}"

    async def delete(self, file_path_or_url: str) -> bool:
        if file_path_or_url.startswith("/uploads/"):
            rel_path = file_path_or_url.replace("/uploads/", "")
            full_path = os.path.join(self.base_dir, rel_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
        return False


class S3StorageProvider(StorageProvider):
    """Stub ready for AWS S3 credentials injection."""
    def __init__(self, bucket_name: str = ""):
        self.bucket = bucket_name

    async def upload(self, file: UploadFile, subfolder: str = "media") -> str:
        # S3 boto3 upload logic when configured
        raise NotImplementedError("S3 storage backend configured but AWS credentials not provided.")

    async def delete(self, file_path_or_url: str) -> bool:
        return True


class CloudinaryStorageProvider(StorageProvider):
    """Stub ready for Cloudinary upload integration."""
    async def upload(self, file: UploadFile, subfolder: str = "media") -> str:
        raise NotImplementedError("Cloudinary storage provider not configured.")

    async def delete(self, file_path_or_url: str) -> bool:
        return True


def get_storage() -> StorageProvider:
    backend = settings.STORAGE_BACKEND.lower()
    if backend == "s3":
        return S3StorageProvider()
    elif backend == "cloudinary":
        return CloudinaryStorageProvider()
    # Default to robust local development storage
    return LocalStorageProvider(settings.UPLOAD_DIR)
