"""
User model for authentication and profile management
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
import uuid

from app.core.database import Base

class UserRole(str, Enum):
    """User roles enum"""
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"

class SubscriptionPlan(str, Enum):
    """Subscription plans enum"""
    STARTER = "starter"
    GROWTH = "growth"
    ENTERPRISE = "enterprise"

class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    
    # User status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    
    # Subscription
    subscription_plan = Column(SQLEnum(SubscriptionPlan), default=SubscriptionPlan.STARTER)
    subscription_active = Column(Boolean, default=True)
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Profile information
    company_name = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Usage limits based on plan
    max_accounts = Column(Integer, default=3)  # Starter: 3, Growth: 10, Enterprise: unlimited
    max_monthly_creatives = Column(Integer, default=500)  # Starter: 500, Growth: 10k, Enterprise: unlimited
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    creative_analytics = relationship("CreativeAnalytic", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', plan='{self.subscription_plan}')>"
    
    @property
    def is_starter(self):
        return self.subscription_plan == SubscriptionPlan.STARTER
    
    @property
    def is_growth(self):
        return self.subscription_plan == SubscriptionPlan.GROWTH
    
    @property
    def is_enterprise(self):
        return self.subscription_plan == SubscriptionPlan.ENTERPRISE
    
    def can_add_account(self, current_count: int) -> bool:
        """Check if user can add more accounts"""
        if self.is_enterprise:
            return True
        return current_count < self.max_accounts
    
    def can_analyze_creatives(self, current_monthly_count: int) -> bool:
        """Check if user can analyze more creatives this month"""
        if self.is_enterprise:
            return True
        return current_monthly_count < self.max_monthly_creatives 