"""
Account model for social media account management
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.core.database import Base

class Platform(str, Enum):
    """Social media platforms enum"""
    YOUTUBE = "youtube"

class AccountStatus(str, Enum):
    """Account status enum"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"

class Account(Base):
    """Social media account model"""
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Account details
    platform = Column(SQLEnum(Platform), nullable=False)
    platform_account_id = Column(String, nullable=False)  # Instagram business ID, YouTube channel ID, etc.
    username = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    
    # Profile information
    profile_picture_url = Column(String, nullable=True)
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    post_count = Column(Integer, default=0)
    
    # Account status and monitoring
    status = Column(SQLEnum(AccountStatus), default=AccountStatus.PENDING)
    is_business_account = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # API tokens and credentials (encrypted)
    access_token = Column(String, nullable=True)  # Encrypted
    refresh_token = Column(String, nullable=True)  # Encrypted
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Collection settings
    auto_collection_enabled = Column(Boolean, default=True)
    collection_frequency_hours = Column(Integer, default=1)  # How often to collect data
    last_collection_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    platform_metadata = Column(JSON, nullable=True)  # Store platform-specific data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="accounts")
    creatives = relationship("Creative", back_populates="account", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Account(id={self.id}, platform='{self.platform}', username='{self.username}')>"
    
    @property
    def is_youtube(self):
        return self.platform == Platform.YOUTUBE
    
    def needs_token_refresh(self) -> bool:
        """Check if token needs refresh"""
        if not self.token_expires_at:
            return False
        from datetime import datetime, timezone
        return datetime.now(timezone.utc) >= self.token_expires_at
    
    def is_collection_due(self) -> bool:
        """Check if it's time for data collection"""
        if not self.auto_collection_enabled:
            return False
        if not self.last_collection_at:
            return True
        from datetime import datetime, timezone, timedelta
        next_collection = self.last_collection_at + timedelta(hours=self.collection_frequency_hours)
        return datetime.now(timezone.utc) >= next_collection 