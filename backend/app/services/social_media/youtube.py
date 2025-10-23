"""
YouTube data collection service using YouTube Data API v3
"""

import httpx
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
from loguru import logger

from app.core.config import get_settings
from app.core.monitoring import metrics
from app.models.account import Account
from app.models.creative import Creative, CreativeType, ContentType

settings = get_settings()

class YouTubeCollector:
    """YouTube data collector using YouTube Data API v3"""
    
    def __init__(self):
        self.api_base = "https://www.googleapis.com/youtube/v3"
        self.api_key = settings.YOUTUBE_API_KEY
        
    async def collect_channel_videos(self, account: Account, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Collect videos from a YouTube channel
        
        Args:
            account: Account model with channel_id in platform_account_id
            limit: Maximum number of videos to fetch
            
        Returns:
            List of normalized video data
        """
        try:
            videos_data = []
            channel_id = account.platform_account_id
            
            # Step 1: Get channel's uploads playlist ID
            uploads_playlist_id = await self._get_uploads_playlist_id(channel_id)
            if not uploads_playlist_id:
                logger.error(f"Could not find uploads playlist for channel {channel_id}")
                return []
            
            # Step 2: Get video IDs from the uploads playlist
            video_ids = await self._get_playlist_video_ids(uploads_playlist_id, limit)
            if not video_ids:
                logger.warning(f"No videos found in channel {account.username}")
                return []
            
            # Step 3: Get detailed video information and statistics
            videos_data = await self._get_videos_details(video_ids)
            
            logger.info(f"Collected {len(videos_data)} videos from {account.username}")
            return videos_data
            
        except Exception as e:
            logger.error(f"Error collecting YouTube videos for {account.username}: {str(e)}")
            metrics.record_collection_error("youtube", "video_collection")
            return []
    
    async def _get_uploads_playlist_id(self, channel_id: str) -> Optional[str]:
        """Get the uploads playlist ID for a channel"""
        try:
            url = f"{self.api_base}/channels"
            params = {
                "part": "contentDetails",
                "id": channel_id,
                "key": self.api_key
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                metrics.record_api_call("youtube", "channel_info")
                
                if response.status_code != 200:
                    logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                    return None
                
                data = response.json()
                items = data.get("items", [])
                
                if items:
                    return items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
                    
        except Exception as e:
            logger.error(f"Error getting uploads playlist: {str(e)}")
        
        return None
    
    async def _get_playlist_video_ids(self, playlist_id: str, max_results: int = 50) -> List[str]:
        """Get video IDs from a playlist"""
        try:
            video_ids = []
            url = f"{self.api_base}/playlistItems"
            params = {
                "part": "contentDetails",
                "playlistId": playlist_id,
                "maxResults": min(max_results, 50),  # API limit is 50
                "key": self.api_key
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                metrics.record_api_call("youtube", "playlist_items")
                
                if response.status_code != 200:
                    logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                    return []
                
                data = response.json()
                
                for item in data.get("items", []):
                    video_id = item["contentDetails"]["videoId"]
                    video_ids.append(video_id)
            
            return video_ids
            
        except Exception as e:
            logger.error(f"Error getting playlist items: {str(e)}")
            return []
    
    async def _get_videos_details(self, video_ids: List[str]) -> List[Dict[str, Any]]:
        """Get detailed information for multiple videos"""
        try:
            videos_data = []
            
            # YouTube API allows up to 50 video IDs per request
            chunk_size = 50
            for i in range(0, len(video_ids), chunk_size):
                chunk = video_ids[i:i + chunk_size]
                
                url = f"{self.api_base}/videos"
                params = {
                    "part": "snippet,contentDetails,statistics",
                    "id": ",".join(chunk),
                    "key": self.api_key
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.get(url, params=params)
                    metrics.record_api_call("youtube", "video_details")
                    
                    if response.status_code != 200:
                        logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                        continue
                    
                    data = response.json()
                    
                    for item in data.get("items", []):
                        normalized_video = self._normalize_video_data(item)
                        if normalized_video:
                            videos_data.append(normalized_video)
            
            return videos_data
            
        except Exception as e:
            logger.error(f"Error getting video details: {str(e)}")
            return []
    
    def _normalize_video_data(self, raw_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Normalize YouTube video data to common format"""
        try:
            snippet = raw_data.get("snippet", {})
            statistics = raw_data.get("statistics", {})
            content_details = raw_data.get("contentDetails", {})
            
            video_id = raw_data["id"]
            
            # Parse published date
            published_at_str = snippet.get("publishedAt", "")
            published_at = None
            if published_at_str:
                published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00"))
            
            return {
                "platform_creative_id": video_id,
                "platform_url": f"https://www.youtube.com/watch?v={video_id}",
                "creative_type": CreativeType.ORGANIC,
                "content_type": ContentType.VIDEO,
                "title": snippet.get("title", ""),
                "caption": snippet.get("description", ""),
                "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                "published_at": published_at,
                "duration": content_details.get("duration", ""),
                "metrics": {
                    "views": int(statistics.get("viewCount", 0)),
                    "likes": int(statistics.get("likeCount", 0)),
                    "comments": int(statistics.get("commentCount", 0)),
                    "favorites": int(statistics.get("favoriteCount", 0)),
                },
                "tags": snippet.get("tags", []),
                "category_id": snippet.get("categoryId", ""),
                "embed_html": f'<iframe width="560" height="315" src="https://www.youtube.com/embed/{video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
            }
            
        except Exception as e:
            logger.error(f"Error normalizing video data: {str(e)}")
            return None
    
    async def get_channel_info(self, channel_id: str) -> Optional[Dict[str, Any]]:
        """Get channel information"""
        try:
            url = f"{self.api_base}/channels"
            params = {
                "part": "snippet,statistics",
                "id": channel_id,
                "key": self.api_key
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                metrics.record_api_call("youtube", "channel_info")
                
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    
                    if items:
                        item = items[0]
                        snippet = item.get("snippet", {})
                        statistics = item.get("statistics", {})
                        
                        return {
                            "id": channel_id,
                            "title": snippet.get("title", ""),
                            "description": snippet.get("description", ""),
                            "custom_url": snippet.get("customUrl", ""),
                            "published_at": snippet.get("publishedAt", ""),
                            "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                            "subscriber_count": int(statistics.get("subscriberCount", 0)),
                            "video_count": int(statistics.get("videoCount", 0)),
                            "view_count": int(statistics.get("viewCount", 0)),
                        }
                    
        except Exception as e:
            logger.error(f"Error getting channel info for {channel_id}: {str(e)}")
        
        return None
    
    async def search_channels(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search for YouTube channels"""
        try:
            url = f"{self.api_base}/search"
            params = {
                "part": "snippet",
                "q": query,
                "type": "channel",
                "maxResults": max_results,
                "key": self.api_key
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                metrics.record_api_call("youtube", "search")
                
                if response.status_code != 200:
                    logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                    return []
                
                data = response.json()
                channels = []
                
                for item in data.get("items", []):
                    snippet = item.get("snippet", {})
                    channels.append({
                        "channel_id": item["snippet"]["channelId"],
                        "title": snippet.get("title", ""),
                        "description": snippet.get("description", ""),
                        "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                    })
                
                return channels
                
        except Exception as e:
            logger.error(f"Error searching channels: {str(e)}")
            return []

# Instance for easy import
youtube_collector = YouTubeCollector()




