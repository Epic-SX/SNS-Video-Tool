"""
Creative-related Pydantic schemas
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class CreativeResponse(BaseModel):
    """Schema for creative response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    platform_creative_id: str
    platform_url: str
    creative_type: str
    content_type: str
    caption: Optional[str] = None
    title: Optional[str] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    published_at: datetime
    account: Dict[str, Any]
    latest_metrics: Optional[Dict[str, Any]] = None
    ai_labels: Optional[Dict[str, Any]] = None

class CreativeListResponse(BaseModel):
    """Schema for creative list response"""
    creatives: List[CreativeResponse]
    total_count: int
    offset: int
    limit: int
    has_more: bool

class BuzzAnalysisResponse(BaseModel):
    """Schema for buzz analysis response"""
    creative_id: int
    hit_probability_score: float
    viral_potential: str
    analysis_details: Dict[str, Any]
    success_factors: List[str]
    analyzed_at: datetime

class CreativeFilterParams(BaseModel):
    """Schema for creative filtering parameters"""
    platform: Optional[str] = None
    creative_type: Optional[str] = None
    content_type: Optional[str] = None
    days_back: Optional[int] = 7
    limit: Optional[int] = 50
    offset: Optional[int] = 0
    sort_by: Optional[str] = "published_at"
    sort_order: Optional[str] = "desc" 