"""
Creative model for social media content data
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Text, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.core.database import Base

class CreativeType(str, Enum):
    """Creative content type enum"""
    ORGANIC = "organic"
    PAID = "paid"

class ContentType(str, Enum):
    """Content type enum"""
    IMAGE = "image"
    VIDEO = "video"
    CAROUSEL = "carousel"
    STORY = "story"
    REEL = "reel"
    SHORT = "short"

class Creative(Base):
    """Creative content model"""
    __tablename__ = "creatives"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    
    # Platform identifiers
    platform_creative_id = Column(String, nullable=False, index=True)  # Instagram media ID, YouTube video ID, etc.
    platform_url = Column(String, nullable=False)  # Permanent link to the content
    
    # Creative classification
    creative_type = Column(SQLEnum(CreativeType), nullable=False)  # organic or paid
    content_type = Column(SQLEnum(ContentType), nullable=False)  # image, video, etc.
    
    # Content details
    caption = Column(Text, nullable=True)
    title = Column(String, nullable=True)  # For YouTube videos
    description = Column(Text, nullable=True)
    hashtags = Column(JSON, nullable=True)  # List of hashtag strings
    mentions = Column(JSON, nullable=True)  # List of mention strings
    
    # Media URLs (Route 1 - no local storage)
    media_url = Column(String, nullable=True)  # Direct media URL for embed
    thumbnail_url = Column(String, nullable=True)
    embed_html = Column(Text, nullable=True)  # oEmbed HTML
    
    # Content metadata
    duration_seconds = Column(Float, nullable=True)  # For videos
    dimensions_width = Column(Integer, nullable=True)
    dimensions_height = Column(Integer, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    
    # Publishing info
    published_at = Column(DateTime(timezone=True), nullable=False)
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Ad-specific data (for paid content)
    ad_account_id = Column(String, nullable=True)
    advertiser_name = Column(String, nullable=True)
    campaign_name = Column(String, nullable=True)
    ad_delivery_start_time = Column(DateTime(timezone=True), nullable=True)
    ad_delivery_stop_time = Column(DateTime(timezone=True), nullable=True)
    impression_range_lower = Column(Integer, nullable=True)
    impression_range_upper = Column(Integer, nullable=True)
    target_regions = Column(JSON, nullable=True)  # List of region strings
    
    # Collection metadata
    first_collected_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    collection_source = Column(String, nullable=True)  # API endpoint used
    
    # Platform-specific metadata
    platform_metadata = Column(JSON, nullable=True)
    
    # Relationships
    account = relationship("Account", back_populates="creatives")
    metrics = relationship("Metric", back_populates="creative", cascade="all, delete-orphan")
    labels = relationship("Label", back_populates="creative", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Creative(id={self.id}, platform_id='{self.platform_creative_id}', type='{self.creative_type}')>"
    
    @property
    def is_organic(self):
        return self.creative_type == CreativeType.ORGANIC
    
    @property
    def is_paid(self):
        return self.creative_type == CreativeType.PAID
    
    @property
    def is_video_content(self):
        return self.content_type in [ContentType.VIDEO, ContentType.REEL, ContentType.SHORT]
    
    @property
    def is_image_content(self):
        return self.content_type in [ContentType.IMAGE, ContentType.CAROUSEL, ContentType.STORY]
    
    def get_hashtag_string(self) -> str:
        """Get hashtags as a string"""
        if not self.hashtags:
            return ""
        return " ".join([f"#{tag}" for tag in self.hashtags])
    
    def get_mention_string(self) -> str:
        """Get mentions as a string"""
        if not self.mentions:
            return ""
        return " ".join([f"@{mention}" for mention in self.mentions])
    
    def get_estimated_impressions(self) -> int:
        """Get estimated impressions (middle of range for ads, latest metric for organic)"""
        if self.is_paid and self.impression_range_lower and self.impression_range_upper:
            return (self.impression_range_lower + self.impression_range_upper) // 2
        
        # For organic content, get latest impressions from metrics
        latest_metric = max(self.metrics, key=lambda m: m.measured_at, default=None)
        return latest_metric.impressions if latest_metric and latest_metric.impressions else 0 