"""
Phase 3 — Analytics Models
ProfileView: tracks who viewed a model's profile
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ProfileView(Base):
    __tablename__ = "profile_views"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)
    viewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    viewer_role = Column(String(50), nullable=True)  # Brand, Agency, anonymous
    viewer_ip = Column(String(60), nullable=True)
    referrer = Column(String(255), nullable=True)
    viewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    profile = relationship("ModelProfile", foreign_keys=[profile_id])
