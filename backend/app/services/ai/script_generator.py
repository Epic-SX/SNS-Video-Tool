"""
AI Script Generator Service - Generate video scripts from video data
Similar to 2nd-buzz.com script generation feature
"""

from typing import Dict, List, Optional, Any
from openai import AsyncOpenAI
from loguru import logger
import json

from app.core.config import get_settings

settings = get_settings()


class ScriptGenerator:
    """Generate video scripts using OpenAI GPT-4o"""
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
    
    async def generate_script_from_video(
        self,
        video_data: Dict[str, Any],
        script_length: str = "medium",
        style: str = "engaging"
    ) -> Dict[str, Any]:
        """
        Generate a script based on video content
        
        Args:
            video_data: Video information (title, description, tags, etc.)
            script_length: 'short' (30s), 'medium' (60s), 'long' (120s+)
            style: 'engaging', 'educational', 'entertaining', 'professional'
            
        Returns:
            Generated script with sections and timing
        """
        try:
            title = video_data.get("title", "")
            description = video_data.get("description", "")
            tags = video_data.get("tags", [])
            duration = video_data.get("duration_seconds", 60)
            
            # Build prompt for script generation
            prompt = self._build_script_prompt(
                title=title,
                description=description,
                tags=tags,
                target_duration=duration,
                script_length=script_length,
                style=style
            )
            
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert video script writer specializing in viral social media content. You create engaging, structured scripts that capture attention and drive engagement."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            script_content = response.choices[0].message.content
            
            # Parse and structure the script
            structured_script = self._parse_script_response(script_content, duration)
            
            logger.info(f"Generated script for video: {title[:50]}...")
            return structured_script
            
        except Exception as e:
            logger.error(f"Error generating script: {str(e)}")
            return self._get_default_script()
    
    async def generate_script_from_idea(
        self,
        idea: str,
        target_platform: str = "youtube",
        target_duration: int = 60,
        style: str = "engaging"
    ) -> Dict[str, Any]:
        """
        Generate a script from a content idea
        
        Args:
            idea: Content idea or topic
            target_platform: 'youtube', 'tiktok', 'instagram'
            target_duration: Duration in seconds
            style: Script style
            
        Returns:
            Generated script with structure
        """
        try:
            prompt = f"""
            Create a viral video script for {target_platform} based on this idea:
            "{idea}"
            
            Requirements:
            - Target duration: {target_duration} seconds
            - Style: {style}
            - Include: Hook, Main Content, Call-to-Action
            - Format for {target_platform} best practices
            
            Provide a structured script with:
            1. HOOK (0-5 seconds): Attention-grabbing opening
            2. INTRODUCTION (5-10 seconds): Context setting
            3. MAIN CONTENT (varies): Core message/value
            4. CALL-TO-ACTION (last 5-10 seconds): Clear next step
            
            Also include:
            - Visual suggestions for each section
            - Text overlay recommendations
            - Pacing notes
            - Estimated word count per section
            
            Format as JSON with keys: hook, introduction, main_content, cta, visual_suggestions, pacing_notes
            """
            
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert viral content script writer."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,
                max_tokens=2000
            )
            
            script_content = response.choices[0].message.content
            
            # Try to parse as JSON
            try:
                structured_script = json.loads(script_content)
            except json.JSONDecodeError:
                # Fallback to text parsing
                structured_script = self._parse_script_response(script_content, target_duration)
            
            # Add metadata
            structured_script["metadata"] = {
                "idea": idea,
                "platform": target_platform,
                "duration": target_duration,
                "style": style,
                "generated_at": str(logger._core.now())
            }
            
            logger.info(f"Generated script from idea: {idea[:50]}...")
            return structured_script
            
        except Exception as e:
            logger.error(f"Error generating script from idea: {str(e)}")
            return self._get_default_script()
    
    async def improve_script(
        self,
        original_script: str,
        improvement_focus: List[str] = None
    ) -> Dict[str, Any]:
        """
        Improve an existing script
        
        Args:
            original_script: The original script text
            improvement_focus: Areas to focus on (e.g., ['hook', 'cta', 'pacing'])
            
        Returns:
            Improved script with change notes
        """
        try:
            focus_areas = improvement_focus or ["overall"]
            focus_str = ", ".join(focus_areas)
            
            prompt = f"""
            Improve this video script, focusing on: {focus_str}
            
            Original Script:
            {original_script}
            
            Provide:
            1. Improved script
            2. List of changes made
            3. Explanation for each improvement
            4. Estimated impact on engagement
            
            Format as JSON with keys: improved_script, changes, explanations, impact_analysis
            """
            
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert script editor specializing in viral social media content."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=2000
            )
            
            result = response.choices[0].message.content
            
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                return {
                    "improved_script": result,
                    "changes": ["Script improved"],
                    "explanations": ["Various improvements applied"],
                    "impact_analysis": "Moderate positive impact expected"
                }
                
        except Exception as e:
            logger.error(f"Error improving script: {str(e)}")
            return {
                "improved_script": original_script,
                "changes": [],
                "explanations": ["Error occurred during improvement"],
                "impact_analysis": "Unable to analyze"
            }
    
    async def generate_hooks(
        self,
        video_topic: str,
        count: int = 5
    ) -> List[Dict[str, str]]:
        """
        Generate multiple hook options for a video
        
        Args:
            video_topic: The video topic or theme
            count: Number of hooks to generate
            
        Returns:
            List of hook options with explanations
        """
        try:
            prompt = f"""
            Generate {count} different attention-grabbing hooks for a video about: "{video_topic}"
            
            For each hook:
            1. Write the hook (1-2 sentences, under 10 seconds to say)
            2. Explain why it works
            3. Rate its viral potential (1-10)
            4. Suggest the target audience
            
            Format as JSON array with keys: hook, explanation, viral_rating, target_audience
            """
            
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at creating viral video hooks."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.9,
                max_tokens=1500
            )
            
            result = response.choices[0].message.content
            
            try:
                hooks = json.loads(result)
                return hooks if isinstance(hooks, list) else []
            except json.JSONDecodeError:
                # Fallback parsing
                return self._parse_hooks_response(result, count)
                
        except Exception as e:
            logger.error(f"Error generating hooks: {str(e)}")
            return []
    
    async def generate_call_to_actions(
        self,
        video_goal: str,
        platform: str = "youtube"
    ) -> List[Dict[str, str]]:
        """
        Generate call-to-action options
        
        Args:
            video_goal: The goal (e.g., 'subscribe', 'website visit', 'product purchase')
            platform: Target platform
            
        Returns:
            List of CTA options
        """
        try:
            prompt = f"""
            Generate 5 effective call-to-action phrases for a {platform} video with the goal: "{video_goal}"
            
            For each CTA:
            1. Write the CTA phrase
            2. Explain the psychology behind it
            3. Suggest when to use it in the video
            4. Rate its effectiveness (1-10)
            
            Format as JSON array with keys: cta, psychology, timing, effectiveness
            """
            
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at creating effective call-to-actions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1200
            )
            
            result = response.choices[0].message.content
            
            try:
                ctas = json.loads(result)
                return ctas if isinstance(ctas, list) else []
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            logger.error(f"Error generating CTAs: {str(e)}")
            return []
    
    def _build_script_prompt(
        self,
        title: str,
        description: str,
        tags: List[str],
        target_duration: int,
        script_length: str,
        style: str
    ) -> str:
        """Build prompt for script generation"""
        return f"""
        Generate a {style} video script based on this video:
        
        Title: {title}
        Description: {description}
        Tags: {', '.join(tags[:10])}
        Target Duration: {target_duration} seconds
        Length Preference: {script_length}
        
        Create a structured script with:
        
        1. HOOK (0-5s): 
           - Grab attention immediately
           - Create curiosity or present a problem
        
        2. INTRODUCTION (5-15s):
           - Establish context
           - Promise value
        
        3. MAIN CONTENT ({int(target_duration * 0.6)}s):
           - Deliver core message
           - Provide value/entertainment
           - Use storytelling
        
        4. CALL-TO-ACTION (last 10s):
           - Clear next step
           - Engagement prompt
        
        Include:
        - Exact words to say
        - Visual suggestions
        - Pacing notes
        - Estimated timing for each section
        
        Format: Structured text with clear sections
        """
    
    def _parse_script_response(self, response: str, duration: int) -> Dict[str, Any]:
        """Parse script response into structured format"""
        # Simple parsing - in production, use more robust parsing
        sections = {
            "hook": "",
            "introduction": "",
            "main_content": "",
            "cta": "",
            "visual_suggestions": [],
            "pacing_notes": "",
            "estimated_duration": duration,
            "full_script": response
        }
        
        # Try to extract sections
        lines = response.split('\n')
        current_section = None
        
        for line in lines:
            line_lower = line.lower()
            if 'hook' in line_lower:
                current_section = 'hook'
            elif 'introduction' in line_lower or 'intro' in line_lower:
                current_section = 'introduction'
            elif 'main content' in line_lower or 'body' in line_lower:
                current_section = 'main_content'
            elif 'call' in line_lower and 'action' in line_lower or 'cta' in line_lower:
                current_section = 'cta'
            elif current_section and line.strip():
                sections[current_section] += line + "\n"
        
        return sections
    
    def _parse_hooks_response(self, response: str, count: int) -> List[Dict[str, str]]:
        """Parse hooks from text response"""
        # Fallback parsing
        hooks = []
        lines = response.split('\n')
        current_hook = {}
        
        for line in lines:
            if line.strip().startswith(('1.', '2.', '3.', '4.', '5.')):
                if current_hook:
                    hooks.append(current_hook)
                current_hook = {"hook": line.strip(), "explanation": "", "viral_rating": 7}
            elif current_hook and line.strip():
                current_hook["explanation"] += line.strip() + " "
        
        if current_hook:
            hooks.append(current_hook)
        
        return hooks[:count]
    
    def _get_default_script(self) -> Dict[str, Any]:
        """Return default script structure"""
        return {
            "hook": "Start with an attention-grabbing statement or question",
            "introduction": "Introduce the topic and what viewers will learn",
            "main_content": "Deliver your main message with clear value",
            "cta": "Ask viewers to like, comment, and subscribe",
            "visual_suggestions": [
                "Use dynamic transitions",
                "Include text overlays for key points",
                "Show relevant visuals"
            ],
            "pacing_notes": "Keep energy high throughout",
            "estimated_duration": 60,
            "full_script": "Script generation failed. Please try again."
        }


# Singleton instance
script_generator = ScriptGenerator()



