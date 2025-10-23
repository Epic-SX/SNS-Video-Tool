"""
API endpoints for AI script generation - Similar to 2nd-buzz.com
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from pydantic import BaseModel, Field

from app.services.ai.script_generator import script_generator
from app.services.social_media.youtube_trending import youtube_trending
from loguru import logger

router = APIRouter()


# Request Models
class GenerateScriptFromVideoRequest(BaseModel):
    video_id: str = Field(..., description="YouTube video ID")
    script_length: str = Field(default="medium", description="short, medium, or long")
    style: str = Field(default="engaging", description="Script style: engaging, educational, entertaining, professional")


class GenerateScriptFromIdeaRequest(BaseModel):
    idea: str = Field(..., description="Content idea or topic", min_length=10)
    target_platform: str = Field(default="youtube", description="youtube, tiktok, instagram")
    target_duration: int = Field(default=60, ge=15, le=600, description="Duration in seconds")
    style: str = Field(default="engaging", description="Script style")


class ImproveScriptRequest(BaseModel):
    original_script: str = Field(..., description="The original script to improve", min_length=20)
    improvement_focus: Optional[List[str]] = Field(
        default=None,
        description="Areas to focus on: hook, introduction, main_content, cta, pacing"
    )


class GenerateHooksRequest(BaseModel):
    video_topic: str = Field(..., description="Video topic or theme", min_length=5)
    count: int = Field(default=5, ge=1, le=10, description="Number of hooks to generate")


class GenerateCTAsRequest(BaseModel):
    video_goal: str = Field(..., description="Video goal (e.g., subscribe, visit website, buy product)")
    platform: str = Field(default="youtube", description="Target platform")


# Response Models
class ScriptSectionResponse(BaseModel):
    hook: str
    introduction: str
    main_content: str
    cta: str
    visual_suggestions: List[str] = []
    pacing_notes: str
    estimated_duration: int
    full_script: str


class HookResponse(BaseModel):
    hook: str
    explanation: str
    viral_rating: Optional[int] = None
    target_audience: Optional[str] = None


class CTAResponse(BaseModel):
    cta: str
    psychology: Optional[str] = None
    timing: Optional[str] = None
    effectiveness: Optional[int] = None


class ImproveScriptResponse(BaseModel):
    improved_script: str
    changes: List[str]
    explanations: List[str]
    impact_analysis: str


# Endpoints
@router.post("/generate-from-video", response_model=ScriptSectionResponse)
async def generate_script_from_video(request: GenerateScriptFromVideoRequest):
    """
    Generate a script based on a YouTube video
    
    Analyzes video content and generates an optimized script
    Similar to 2nd-buzz.com script generation feature
    """
    try:
        # Get video details
        videos = await youtube_trending._get_videos_details([request.video_id])
        
        if not videos:
            raise HTTPException(status_code=404, detail="Video not found")
        
        video_data = videos[0]
        
        # Generate script
        script = await script_generator.generate_script_from_video(
            video_data=video_data,
            script_length=request.script_length,
            style=request.style
        )
        
        return script
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating script from video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating script: {str(e)}")


@router.post("/generate-from-idea", response_model=ScriptSectionResponse)
async def generate_script_from_idea(request: GenerateScriptFromIdeaRequest):
    """
    Generate a script from a content idea
    
    Creates a complete video script from a topic or idea
    """
    try:
        script = await script_generator.generate_script_from_idea(
            idea=request.idea,
            target_platform=request.target_platform,
            target_duration=request.target_duration,
            style=request.style
        )
        
        return script
        
    except Exception as e:
        logger.error(f"Error generating script from idea: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating script: {str(e)}")


@router.post("/improve", response_model=ImproveScriptResponse)
async def improve_script(request: ImproveScriptRequest):
    """
    Improve an existing script
    
    Enhances script quality with AI-powered suggestions
    """
    try:
        improved = await script_generator.improve_script(
            original_script=request.original_script,
            improvement_focus=request.improvement_focus
        )
        
        return improved
        
    except Exception as e:
        logger.error(f"Error improving script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error improving script: {str(e)}")


@router.post("/generate-hooks", response_model=List[HookResponse])
async def generate_hooks(request: GenerateHooksRequest):
    """
    Generate multiple hook options for a video
    
    Creates attention-grabbing opening lines
    """
    try:
        hooks = await script_generator.generate_hooks(
            video_topic=request.video_topic,
            count=request.count
        )
        
        return hooks
        
    except Exception as e:
        logger.error(f"Error generating hooks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating hooks: {str(e)}")


@router.post("/generate-ctas", response_model=List[CTAResponse])
async def generate_call_to_actions(request: GenerateCTAsRequest):
    """
    Generate call-to-action options
    
    Creates effective CTAs for different goals
    """
    try:
        ctas = await script_generator.generate_call_to_actions(
            video_goal=request.video_goal,
            platform=request.platform
        )
        
        return ctas
        
    except Exception as e:
        logger.error(f"Error generating CTAs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating CTAs: {str(e)}")


@router.get("/script-templates")
async def get_script_templates():
    """
    Get pre-made script templates for common video types
    """
    templates = {
        "tutorial": {
            "name": "Tutorial/How-To",
            "structure": {
                "hook": "State the problem or show the end result",
                "intro": "Introduce yourself and what they'll learn",
                "main": "Step-by-step instructions",
                "cta": "Ask them to try it and share results"
            },
            "estimated_duration": "5-15 minutes"
        },
        "product_review": {
            "name": "Product Review",
            "structure": {
                "hook": "Show the product in action",
                "intro": "Explain why you're reviewing it",
                "main": "Pros, cons, and demonstration",
                "cta": "Share your opinion in comments"
            },
            "estimated_duration": "8-12 minutes"
        },
        "vlog": {
            "name": "Vlog",
            "structure": {
                "hook": "Preview the most interesting moment",
                "intro": "Set the scene and context",
                "main": "Story/journey with peaks and valleys",
                "cta": "Invite them to follow your journey"
            },
            "estimated_duration": "10-20 minutes"
        },
        "listicle": {
            "name": "Top 10/Listicle",
            "structure": {
                "hook": "Tease #1 item",
                "intro": "Explain the list criteria",
                "main": "Count down items with explanations",
                "cta": "Ask what they would add to the list"
            },
            "estimated_duration": "8-15 minutes"
        },
        "challenge": {
            "name": "Challenge Video",
            "structure": {
                "hook": "Show most exciting challenge moment",
                "intro": "Explain challenge rules",
                "main": "Attempt challenge with reactions",
                "cta": "Challenge viewers to try it"
            },
            "estimated_duration": "5-10 minutes"
        },
        "story_time": {
            "name": "Story Time",
            "structure": {
                "hook": "Start at the climax",
                "intro": "Set up the backstory",
                "main": "Tell the story chronologically",
                "cta": "Ask if they've had similar experiences"
            },
            "estimated_duration": "10-20 minutes"
        }
    }
    
    return {"templates": templates}


@router.get("/style-guides")
async def get_style_guides():
    """
    Get style guides for different content types
    """
    styles = {
        "engaging": {
            "description": "Dynamic, conversational, and entertaining",
            "characteristics": [
                "Use questions to engage viewers",
                "Include humor and personality",
                "Vary tone and pace",
                "Use casual language"
            ],
            "best_for": ["vlogs", "entertainment", "lifestyle"]
        },
        "educational": {
            "description": "Clear, informative, and structured",
            "characteristics": [
                "Use clear explanations",
                "Provide examples and demonstrations",
                "Organize information logically",
                "Summarize key points"
            ],
            "best_for": ["tutorials", "courses", "how-to videos"]
        },
        "professional": {
            "description": "Polished, authoritative, and business-focused",
            "characteristics": [
                "Use formal language",
                "Focus on data and facts",
                "Maintain consistent tone",
                "Emphasize credibility"
            ],
            "best_for": ["business", "finance", "corporate"]
        },
        "entertaining": {
            "description": "Fun, energetic, and attention-grabbing",
            "characteristics": [
                "High energy delivery",
                "Include jokes and references",
                "Use dramatic pauses",
                "Create suspense"
            ],
            "best_for": ["comedy", "challenges", "reactions"]
        }
    }
    
    return {"styles": styles}



