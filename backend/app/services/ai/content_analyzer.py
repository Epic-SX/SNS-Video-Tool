"""
AI content analysis service for buzz factor analysis and content generation
"""

import base64
import httpx
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import asyncio
from io import BytesIO
from PIL import Image
import time

from openai import AsyncOpenAI
from loguru import logger

from app.core.config import get_settings
from app.core.monitoring import metrics
from app.models.creative import Creative
from app.models.label import Label, LabelType

settings = get_settings()

class ContentAnalyzer:
    """AI-powered content analysis for buzz factors and content generation"""
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        
        # Genre categories (120 categories like kataseru)
        self.genre_categories = [
            "daily_life", "cooking", "fashion", "beauty", "fitness", "travel",
            "comedy", "educational", "music", "dance", "pets", "technology",
            "business", "lifestyle", "motivation", "review", "unboxing",
            "tutorial", "challenge", "transformation", "before_after",
            "comparison", "ranking", "testing", "experiment", "documentary",
            "interview", "q_and_a", "storytime", "behind_scenes", "vlog",
            "haul", "diy", "craft", "art", "photography", "gaming",
            "sports", "news", "politics", "health", "wellness", "meditation",
            "relationship", "family", "parenting", "pregnancy", "wedding",
            "home_decor", "real_estate", "car", "motorcycle", "food",
            "restaurant", "recipe", "baking", "street_food", "luxury",
            "budget", "shopping", "deals", "investment", "cryptocurrency",
            "startup", "productivity", "study", "language_learning",
            "science", "history", "geography", "astronomy", "nature",
            "environment", "sustainability", "charity", "social_issue",
            "mental_health", "self_care", "minimalism", "organization",
            "cleaning", "morning_routine", "night_routine", "skincare",
            "makeup", "hair", "nail_art", "outfit", "styling", "thrift",
            "vintage", "streetwear", "luxury_fashion", "accessories",
            "jewelry", "watches", "shoes", "bags", "perfume", "spa",
            "massage", "yoga", "pilates", "running", "gym", "diet",
            "weight_loss", "muscle_building", "sports_training",
            "adventure", "camping", "hiking", "beach", "city_tour",
            "culture", "festival", "tradition", "language", "anime",
            "manga", "k_pop", "j_pop", "movie", "drama", "book",
            "podcast", "live_stream", "concert", "event", "party",
            "celebration", "seasonal", "holiday", "christmas", "new_year"
        ]
    
    async def analyze_buzz_factors(self, creative: Creative, thumbnail_url: str = None) -> Dict[str, Any]:
        """
        Analyze content for buzz factors using GPT-4o Vision
        Returns 9-axis analysis: Hook, CTA, Duration, Genre, Emotion, Color, Composition, Text, Music
        """
        start_time = time.time()
        
        try:
            # Prepare content for analysis
            analysis_prompt = self._build_analysis_prompt(creative)
            
            messages = [
                {
                    "role": "system",
                    "content": """You are an expert social media content analyst specializing in viral content prediction. 
                    Analyze content across 9 dimensions and provide specific, actionable insights about why content might go viral."""
                },
                {
                    "role": "user",
                    "content": analysis_prompt
                }
            ]
            
            # Add image if available
            if thumbnail_url:
                try:
                    image_content = await self._encode_image_from_url(thumbnail_url)
                    if image_content:
                        messages[1]["content"] = [
                            {"type": "text", "text": analysis_prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_content}"}}
                        ]
                except Exception as e:
                    logger.warning(f"Could not process image for analysis: {str(e)}")
            
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.1,
                max_tokens=2000
            )
            
            analysis_result = self._parse_analysis_response(response.choices[0].message.content)
            
            # Record processing time
            processing_time = time.time() - start_time
            metrics.record_ai_processing_time("buzz_analysis", processing_time)
            
            logger.info(f"Analyzed buzz factors for creative {creative.id} in {processing_time:.2f}s")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing buzz factors: {str(e)}")
            return self._get_default_analysis()
    
    async def calculate_hit_probability(self, creative: Creative, analysis: Dict[str, Any]) -> float:
        """
        Calculate hit probability score (0-100) based on buzz factors and historical data
        """
        try:
            # Base score calculation
            base_score = 50.0  # Neutral starting point
            
            # Hook factor (0-25 points)
            hook_score = self._score_hook_factor(analysis.get("hook", {}))
            
            # CTA factor (0-15 points)
            cta_score = self._score_cta_factor(analysis.get("cta", {}))
            
            # Content timing (0-10 points)
            timing_score = self._score_timing_factor(creative.published_at)
            
            # Genre/trend alignment (0-20 points)
            genre_score = self._score_genre_factor(analysis.get("genre", {}))
            
            # Emotional resonance (0-15 points)
            emotion_score = self._score_emotion_factor(analysis.get("emotion", {}))
            
            # Visual composition (0-15 points)
            visual_score = self._score_visual_factor(analysis.get("composition", {}), analysis.get("color_tone", {}))
            
            # Calculate weighted final score
            final_score = min(100.0, max(0.0, 
                base_score + hook_score + cta_score + timing_score + 
                genre_score + emotion_score + visual_score - 50.0
            ))
            
            logger.debug(f"Hit probability calculation: Hook={hook_score}, CTA={cta_score}, "
                        f"Timing={timing_score}, Genre={genre_score}, Emotion={emotion_score}, "
                        f"Visual={visual_score}, Final={final_score}")
            
            return round(final_score, 1)
            
        except Exception as e:
            logger.error(f"Error calculating hit probability: {str(e)}")
            return 50.0  # Default neutral score
    
    async def generate_content_suggestions(self, user_input: str, brand_context: str = "") -> Dict[str, Any]:
        """
        Generate content suggestions based on user input and brand context
        """
        try:
            prompt = f"""
            Generate creative content suggestions for social media based on this input: "{user_input}"
            
            Brand context: {brand_context if brand_context else "Generic brand"}
            
            Please provide:
            1. 3 compelling hooks/opening lines
            2. 3 call-to-action suggestions
            3. 5 relevant hashtags
            4. Script outline (30-60 seconds)
            5. Visual composition suggestions
            
            Format as JSON with keys: hooks, ctas, hashtags, script, visual_suggestions
            """
            
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a creative social media content strategist."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            # Parse the response
            content = response.choices[0].message.content
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # Fallback parsing if JSON is not perfect
                return self._parse_content_suggestions(content)
                
        except Exception as e:
            logger.error(f"Error generating content suggestions: {str(e)}")
            return self._get_default_suggestions()
    
    def _build_analysis_prompt(self, creative: Creative) -> str:
        """Build analysis prompt for GPT-4o"""
        content_info = f"""
        Content Type: {creative.content_type.value}
        Caption: {creative.caption or 'No caption'}
        Title: {creative.title or 'No title'}  
        Duration: {creative.duration_seconds or 'Unknown'} seconds
        Published: {creative.published_at}
        Platform: {creative.account.platform.value if creative.account else 'Unknown'}
        """
        
        return f"""
        Analyze this social media content for viral potential across 9 dimensions:
        
        {content_info}
        
        Please analyze:
        1. HOOK: What makes the opening engaging? (curiosity, controversy, emotion, surprise)
        2. CTA: Call-to-action strength (comment prompts, shares, saves, engagement)
        3. DURATION: Optimal length for platform and content type
        4. GENRE: Content category and trend alignment
        5. EMOTION: Emotional triggers (joy, surprise, fear, anger, sadness, anticipation)
        6. COLOR_TONE: Visual color psychology (warm, cool, high contrast, etc.)
        7. COMPOSITION: Visual layout and design principles
        8. TEXT_OVERLAY: Text readability and impact
        9. MUSIC_STYLE: Audio elements (if video content)
        
        Rate each dimension 1-10 and explain why. Identify the top 3 factors contributing to viral potential.
        """
    
    def _parse_analysis_response(self, response: str) -> Dict[str, Any]:
        """Parse GPT-4o analysis response into structured data"""
        try:
            # Try to extract structured data from the response
            analysis = {
                "hook": {"score": 5, "type": "unknown", "description": ""},
                "cta": {"score": 5, "type": "unknown", "description": ""},
                "duration": {"score": 5, "category": "medium", "optimal": True},
                "genre": {"score": 5, "category": "general", "trending": False},
                "emotion": {"score": 5, "primary": "neutral", "intensity": 5},
                "color_tone": {"score": 5, "palette": "neutral", "contrast": "medium"},
                "composition": {"score": 5, "layout": "standard", "visual_hierarchy": 5},
                "text_overlay": {"score": 5, "readability": "good", "impact": 5},
                "music_style": {"score": 5, "genre": "none", "energy": 5},
                "top_factors": ["hook", "emotion", "composition"],
                "overall_score": 50
            }
            
            # Simple parsing - in production, you'd want more sophisticated NLP
            lines = response.lower().split('\n')
            for line in lines:
                if 'hook' in line and any(str(i) in line for i in range(1, 11)):
                    score = self._extract_score_from_line(line)
                    if score:
                        analysis["hook"]["score"] = score
                elif 'cta' in line and any(str(i) in line for i in range(1, 11)):
                    score = self._extract_score_from_line(line)
                    if score:
                        analysis["cta"]["score"] = score
                # Add more parsing logic for other dimensions...
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error parsing analysis response: {str(e)}")
            return self._get_default_analysis()
    
    def _extract_score_from_line(self, line: str) -> Optional[int]:
        """Extract numeric score from a line of text"""
        import re
        matches = re.findall(r'\b([1-9]|10)\b', line)
        return int(matches[0]) if matches else None
    
    def _score_hook_factor(self, hook_data: Dict[str, Any]) -> float:
        """Score hook factor (0-25 points)"""
        base_score = hook_data.get("score", 5) * 2.5  # Convert 1-10 to 0-25
        
        # Bonus for strong hook types
        hook_type = hook_data.get("type", "")
        if hook_type in ["curiosity", "controversy", "surprise"]:
            base_score += 5
        
        return min(25.0, base_score)
    
    def _score_cta_factor(self, cta_data: Dict[str, Any]) -> float:
        """Score CTA factor (0-15 points)"""
        base_score = cta_data.get("score", 5) * 1.5  # Convert 1-10 to 0-15
        
        # Bonus for engagement-driving CTAs
        cta_type = cta_data.get("type", "")
        if cta_type in ["comment_prompt", "share_request", "save_reminder"]:
            base_score += 3
            
        return min(15.0, base_score)
    
    def _score_timing_factor(self, published_at: datetime) -> float:
        """Score timing factor (0-10 points)"""
        try:
            # Simple scoring based on posting time
            hour = published_at.hour
            day_of_week = published_at.weekday()
            
            # Peak hours: 6-9 AM, 12-2 PM, 7-10 PM
            if hour in [6, 7, 8, 12, 13, 19, 20, 21]:
                time_score = 8
            elif hour in [9, 10, 11, 14, 15, 16, 17, 18, 22]:
                time_score = 6
            else:
                time_score = 4
            
            # Weekend bonus
            if day_of_week in [5, 6]:  # Saturday, Sunday
                time_score += 2
                
            return min(10.0, time_score)
            
        except Exception:
            return 5.0
    
    def _score_genre_factor(self, genre_data: Dict[str, Any]) -> float:
        """Score genre/trend alignment (0-20 points)"""
        base_score = genre_data.get("score", 5) * 2  # Convert 1-10 to 0-20
        
        # Bonus for trending genres
        if genre_data.get("trending", False):
            base_score += 5
            
        return min(20.0, base_score)
    
    def _score_emotion_factor(self, emotion_data: Dict[str, Any]) -> float:
        """Score emotional resonance (0-15 points)"""
        base_score = emotion_data.get("score", 5) * 1.5
        
        # Bonus for high-engagement emotions
        primary_emotion = emotion_data.get("primary", "")
        if primary_emotion in ["joy", "surprise", "anticipation"]:
            base_score += 3
        elif primary_emotion in ["anger", "fear"]:
            base_score += 2
            
        return min(15.0, base_score)
    
    def _score_visual_factor(self, composition_data: Dict[str, Any], color_data: Dict[str, Any]) -> float:
        """Score visual composition and color (0-15 points)"""
        comp_score = composition_data.get("score", 5) * 0.75
        color_score = color_data.get("score", 5) * 0.75
        
        return min(15.0, comp_score + color_score)
    
    async def _encode_image_from_url(self, image_url: str) -> Optional[str]:
        """Download and encode image from URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url)
                if response.status_code == 200:
                    # Resize image to reduce token usage
                    image = Image.open(BytesIO(response.content))
                    image.thumbnail((settings.IMAGE_RESIZE_WIDTH, settings.IMAGE_RESIZE_WIDTH))
                    
                    # Convert to base64
                    buffer = BytesIO()
                    image.save(buffer, format="JPEG")
                    return base64.b64encode(buffer.getvalue()).decode()
                    
        except Exception as e:
            logger.error(f"Error encoding image: {str(e)}")
        
        return None
    
    def _parse_content_suggestions(self, content: str) -> Dict[str, Any]:
        """Parse content suggestions from text response"""
        # Simplified parsing - in production, use more robust parsing
        return {
            "hooks": ["Hook 1", "Hook 2", "Hook 3"],
            "ctas": ["CTA 1", "CTA 2", "CTA 3"],
            "hashtags": ["#example1", "#example2", "#example3"],
            "script": "Generated script content...",
            "visual_suggestions": ["Visual suggestion 1", "Visual suggestion 2"]
        }
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """Return default analysis structure"""
        return {
            "hook": {"score": 5, "type": "standard", "description": "Standard opening"},
            "cta": {"score": 5, "type": "generic", "description": "Generic call to action"},
            "duration": {"score": 5, "category": "medium", "optimal": True},
            "genre": {"score": 5, "category": "general", "trending": False},
            "emotion": {"score": 5, "primary": "neutral", "intensity": 5},
            "color_tone": {"score": 5, "palette": "neutral", "contrast": "medium"},
            "composition": {"score": 5, "layout": "standard", "visual_hierarchy": 5},
            "text_overlay": {"score": 5, "readability": "good", "impact": 5},
            "music_style": {"score": 5, "genre": "none", "energy": 5},
            "top_factors": ["hook", "emotion", "composition"],
            "overall_score": 50
        }
    
    def _get_default_suggestions(self) -> Dict[str, Any]:
        """Return default content suggestions"""
        return {
            "hooks": ["Try this amazing tip!", "You won't believe what happened!", "Here's what nobody tells you..."],
            "ctas": ["Comment below!", "Share if you agree!", "Save for later!"],
            "hashtags": ["#viral", "#trending", "#mustwatch"],
            "script": "Start with a strong hook, provide value, end with clear CTA",
            "visual_suggestions": ["Use bright colors", "Add text overlay", "Include face in thumbnail"]
        }

# Instance for easy import
content_analyzer = ContentAnalyzer() 