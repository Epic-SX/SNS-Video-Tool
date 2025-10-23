"""
Social media accounts management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.account import Account, Platform, AccountStatus

router = APIRouter()

@router.get("/")
async def get_user_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all connected social media accounts for current user"""
    query = select(Account).where(Account.user_id == current_user.id)
    result = await db.execute(query)
    accounts = result.scalars().all()
    
    return [
        {
            "id": account.id,
            "platform": account.platform.value,
            "username": account.username,
            "display_name": account.display_name,
            "follower_count": account.follower_count,
            "status": account.status.value,
            "is_business_account": account.is_business_account,
            "last_collection_at": account.last_collection_at
        }
        for account in accounts
    ]

@router.post("/")
async def add_account(
    account_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new social media account"""
    # Check account limits
    existing_count = await db.scalar(
        select(Account).where(Account.user_id == current_user.id).count()
    )
    
    if not current_user.can_add_account(existing_count):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account limit reached. Upgrade to add more accounts."
        )
    
    # Create new account (simplified - real implementation would handle OAuth)
    new_account = Account(
        user_id=current_user.id,
        platform=Platform(account_data["platform"]),
        platform_account_id=account_data["platform_account_id"],
        username=account_data["username"],
        status=AccountStatus.PENDING
    )
    
    db.add(new_account)
    await db.commit()
    
    return {"message": "Account added successfully", "account_id": new_account.id} 