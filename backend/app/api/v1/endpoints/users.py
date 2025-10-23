"""
User management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse.from_orm(current_user)

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    # Update allowed fields
    for field, value in user_data.items():
        if hasattr(current_user, field) and field not in ['id', 'email', 'hashed_password']:
            setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.from_orm(current_user) 