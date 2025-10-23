"""
Label model for AI-generated content analysis tags
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum as SQLEnum, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.core.database import Base

class LabelType(str, Enum):
    """Label type enum"""
    HOOK = "hook"  # Opening hook type
    CTA = "cta"  # Call-to-action type
    DURATION = "duration"  # Video length category
    GENRE = "genre"  # Content genre (120 categories)
    EMOTION = "emotion"  # Emotional tone
    COLOR_TONE = "color_tone"  # Visual color analysis
    COMPOSITION = "composition"  # Visual composition
    TEXT_OVERLAY = "text_overlay"  # Text overlay analysis
    MUSIC_STYLE = "music_style"  # Audio/music style
    CUSTOM = "custom"  # User-defined labels

class Label(Base):
    """AI-generated label model"""
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    creative_id = Column(Integer, ForeignKey("creatives.id"), nullable=False)
    
    # Label details
    label_type = Column(SQLEnum(LabelType), nullable=False, index=True)
    label_value = Column(String, nullable=False, index=True)  # e.g., "before_after", "swipe_up", "15s_short"
    display_name = Column(String, nullable=True)  # Human-readable name
    
    # AI confidence and metadata
    confidence_score = Column(Float, nullable=True)  # 0.0 to 1.0
    ai_model_used = Column(String, nullable=True)  # e.g., "gpt-4o-vision", "clip"
    processing_version = Column(String, nullable=True)  # Model version for tracking
    
    # Additional context
    description = Column(Text, nullable=True)
    reasoning = Column(Text, nullable=True)  # AI explanation of why this label was assigned
    
    # Manual override options
    is_verified = Column(Boolean, default=False)  # Manual verification by user
    is_overridden = Column(Boolean, default=False)  # Manual override by user
    original_ai_value = Column(String, nullable=True)  # Store original AI prediction if overridden
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    creative = relationship("Creative", back_populates="labels")
    
    def __repr__(self):
        return f"<Label(id={self.id}, type='{self.label_type}', value='{self.label_value}')>"
    
    @property
    def is_hook_label(self):
        return self.label_type == LabelType.HOOK
    
    @property
    def is_cta_label(self):
        return self.label_type == LabelType.CTA
    
    @property
    def is_high_confidence(self) -> bool:
        """Check if this is a high-confidence prediction"""
        return self.confidence_score and self.confidence_score >= 0.8
    
    @property
    def needs_verification(self) -> bool:
        """Check if this label needs manual verification"""
        return not self.is_verified and (not self.confidence_score or self.confidence_score < 0.7)

class CreativeAnalytic(Base):
    """Analytics and performance tracking for creatives"""
    __tablename__ = "creative_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    creative_id = Column(Integer, ForeignKey("creatives.id"), nullable=False)
    
    # Buzz analysis results
    hit_probability_score = Column(Float, nullable=True)  # 0-100 percentage
    buzz_factor_score = Column(Float, nullable=True)  # Composite buzz score
    viral_potential = Column(String, nullable=True)  # "low", "medium", "high"
    
    # Performance prediction
    predicted_engagement_rate = Column(Float, nullable=True)
    predicted_view_count = Column(Integer, nullable=True)
    prediction_confidence = Column(Float, nullable=True)
    
    # Comparative analysis
    similar_content_performance = Column(Float, nullable=True)  # Average performance of similar content
    industry_benchmark_comparison = Column(Float, nullable=True)  # Relative to industry average
    
    # AI insights
    success_factors = Column(Text, nullable=True)  # AI-generated list of success factors
    improvement_suggestions = Column(Text, nullable=True)  # AI-generated suggestions
    
    # Trend analysis
    trend_alignment_score = Column(Float, nullable=True)  # How well it aligns with current trends
    trend_categories = Column(String, nullable=True)  # Trending categories this content fits
    
    # Time analysis
    optimal_posting_time = Column(String, nullable=True)  # AI-suggested optimal posting time
    posting_time_score = Column(Float, nullable=True)  # How good the actual posting time was
    
    # Metadata
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    analysis_version = Column(String, nullable=True)  # Version of analysis algorithm
    
    # Relationships
    user = relationship("User", back_populates="creative_analytics")
    creative = relationship("Creative")
    
    def __repr__(self):
        return f"<CreativeAnalytic(id={self.id}, hit_score={self.hit_probability_score})>"
    
    @property
    def is_high_potential(self) -> bool:
        """Check if this creative has high viral potential"""
        return self.hit_probability_score and self.hit_probability_score >= 70.0
    
    @property
    def performance_tier(self) -> str:
        """Get performance tier based on hit probability"""
        if not self.hit_probability_score:
            return "unknown"
        
        if self.hit_probability_score >= 80:
            return "excellent"
        elif self.hit_probability_score >= 60:
            return "good"
        elif self.hit_probability_score >= 40:
            return "average"
        else:
            return "poor" 