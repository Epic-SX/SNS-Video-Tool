"""
Authentication schemas
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    """Schema for user creation"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None

class UserResponse(BaseModel):
    """Schema for user response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    uuid: str
    email: str
    username: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    is_active: bool
    is_verified: bool
    role: str
    subscription_plan: str
    subscription_active: bool
    max_accounts: int
    max_monthly_creatives: int
    created_at: datetime
    last_login_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class LoginRequest(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str

class PasswordChangeRequest(BaseModel):
    """Schema for password change"""
    current_password: str
    new_password: str = Field(..., min_length=8) 