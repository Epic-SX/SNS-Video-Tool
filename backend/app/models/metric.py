"""
Metric model for storing engagement and performance data
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Metric(Base):
    """Metric model for storing performance data"""
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    creative_id = Column(Integer, ForeignKey("creatives.id"), nullable=False)
    
    # Engagement metrics
    views = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    
    # Video-specific metrics
    plays = Column(Integer, default=0)
    video_views = Column(Integer, default=0)
    video_views_3s = Column(Integer, default=0)
    video_views_10s = Column(Integer, default=0)
    video_views_30s = Column(Integer, default=0)
    average_watch_time_seconds = Column(Float, default=0.0)
    watch_time_total_seconds = Column(Float, default=0.0)
    
    # Engagement rates (calculated)
    engagement_rate = Column(Float, default=0.0)  # (likes + comments + shares) / impressions
    view_rate = Column(Float, default=0.0)  # views / impressions
    completion_rate = Column(Float, default=0.0)  # for videos
    
    # Growth metrics
    follower_growth = Column(Integer, default=0)
    profile_visits = Column(Integer, default=0)
    website_clicks = Column(Integer, default=0)
    
    # Ad-specific metrics (for paid content)
    clicks = Column(Integer, default=0)
    click_through_rate = Column(Float, default=0.0)
    cost_per_click = Column(Float, default=0.0)
    cost_per_impression = Column(Float, default=0.0)
    spend = Column(Float, default=0.0)
    
    # Time-based data
    measured_at = Column(DateTime(timezone=True), nullable=False)
    collection_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Data quality flags
    is_estimated = Column(Boolean, default=False)  # True if some metrics are estimated
    data_source = Column(String, nullable=True)  # API endpoint or estimation method
    
    # Relationships
    creative = relationship("Creative", back_populates="metrics")
    
    def __repr__(self):
        return f"<Metric(id={self.id}, creative_id={self.creative_id}, views={self.views})>"
    
    def calculate_engagement_rate(self) -> float:
        """Calculate engagement rate"""
        if not self.impressions or self.impressions == 0:
            return 0.0
        engagement = (self.likes + self.comments + self.shares)
        return round((engagement / self.impressions) * 100, 2)
    
    def calculate_view_rate(self) -> float:
        """Calculate view rate"""
        if not self.impressions or self.impressions == 0:
            return 0.0
        return round((self.views / self.impressions) * 100, 2)
    
    def calculate_completion_rate(self) -> float:
        """Calculate video completion rate"""
        if not self.plays or self.plays == 0:
            return 0.0
        if not self.video_views_30s:
            return 0.0
        return round((self.video_views_30s / self.plays) * 100, 2)
    
    def update_calculated_metrics(self):
        """Update all calculated metrics"""
        self.engagement_rate = self.calculate_engagement_rate()
        self.view_rate = self.calculate_view_rate()
        self.completion_rate = self.calculate_completion_rate()
        
        # Update CTR for paid content
        if self.impressions and self.impressions > 0 and self.clicks:
            self.click_through_rate = round((self.clicks / self.impressions) * 100, 2)
    
    @property
    def total_engagement(self) -> int:
        """Get total engagement count"""
        return self.likes + self.comments + self.shares + self.saves
    
    @property
    def is_high_performing(self) -> bool:
        """Check if this is a high-performing post (engagement rate > 3%)"""
        return self.engagement_rate > 3.0
    
    @property
    def buzz_score(self) -> float:
        """Calculate a buzz score based on engagement velocity"""
        # Simple buzz score: engagement rate * view rate * (recent factor)
        from datetime import datetime, timezone, timedelta
        
        now = datetime.now(timezone.utc)
        hours_since_measurement = (now - self.measured_at).total_seconds() / 3600
        
        # Recent content gets higher buzz score
        recency_factor = max(0.1, 1 - (hours_since_measurement / 168))  # Decay over a week
        
        base_score = self.engagement_rate * self.view_rate * recency_factor
        return round(base_score, 2) 