import httpx
import asyncio
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

class RateLimitExceeded(Exception):
    """Raised when API rate limit is exceeded"""
    pass

class CricketAPIError(Exception):
    """Base exception for Cricket API errors"""
    pass

class CricketAPIClient:
    def __init__(self):
        self.base_url = os.environ.get('CRICKET_API_BASE_URL', 'https://api.cricapi.com/v1')
        self.api_key = os.environ.get('CRICKET_API_KEY')
        self.timeout = 30
        self._request_count = 0
        self._request_reset_time = datetime.utcnow()
        
        if not self.api_key:
            logger.warning("CRICKET_API_KEY not found in environment variables")
        
    async def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make authenticated request to Cricket API"""
        if not self.api_key:
            raise CricketAPIError("Cricket API key not configured")
            
        if params is None:
            params = {}
            
        params['apikey'] = self.api_key
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Check rate limiting
        await self._check_rate_limit()
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Making API request to {endpoint}")
                response = await client.get(url, params=params)
                
                self._request_count += 1
                
                if response.status_code == 429:
                    raise RateLimitExceeded("API rate limit exceeded")
                elif response.status_code == 401:
                    raise CricketAPIError("Invalid API key or unauthorized access")
                elif response.status_code >= 400:
                    raise CricketAPIError(f"API request failed: {response.status_code}")
                
                data = response.json()
                logger.info(f"API request successful for {endpoint}")
                return data
                
        except httpx.TimeoutException:
            logger.error(f"API request timeout for {endpoint}")
            raise CricketAPIError("Request timeout")
        except httpx.RequestError as e:
            logger.error(f"API request error for {endpoint}: {str(e)}")
            raise CricketAPIError(f"Request failed: {str(e)}")
    
    async def _check_rate_limit(self):
        """Check and enforce rate limiting"""
        now = datetime.utcnow()
        
        # Reset counter every minute
        if now - self._request_reset_time > timedelta(minutes=1):
            self._request_count = 0
            self._request_reset_time = now
        
        # Check if we're approaching rate limit (50 per minute to be safe)
        if self._request_count >= 50:
            sleep_time = 60 - (now - self._request_reset_time).seconds
            if sleep_time > 0:
                logger.warning(f"Rate limit approaching, sleeping {sleep_time} seconds")
                await asyncio.sleep(sleep_time)
                self._request_count = 0
                self._request_reset_time = datetime.utcnow()
    
    async def get_player_stats(self, player_name: str) -> Optional[Dict[str, Any]]:
        """Get player statistics by name"""
        try:
            endpoint = f"players/{player_name}"
            data = await self._make_request(endpoint)
            
            if data and isinstance(data, list) and len(data) > 0:
                return data[0]  # Return first match
            elif isinstance(data, dict):
                return data
            return None
            
        except Exception as e:
            logger.error(f"Failed to get player stats for {player_name}: {str(e)}")
            raise CricketAPIError(f"Failed to get player stats: {str(e)}")
    
    async def get_live_matches(self) -> List[Dict[str, Any]]:
        """Get current live matches"""
        try:
            data = await self._make_request("live")
            if isinstance(data, dict) and 'data' in data:
                return data['data'] if isinstance(data['data'], list) else []
            return data if isinstance(data, list) else []
            
        except Exception as e:
            logger.error(f"Failed to get live matches: {str(e)}")
            return []  # Return empty list on error, don't raise
    
    async def get_match_schedule(self) -> List[Dict[str, Any]]:
        """Get upcoming match schedule"""
        try:
            data = await self._make_request("schedule")
            if isinstance(data, dict) and 'data' in data:
                return data['data'] if isinstance(data['data'], list) else []
            return data if isinstance(data, list) else []
            
        except Exception as e:
            logger.error(f"Failed to get match schedule: {str(e)}")
            return []  # Return empty list on error, don't raise
    
    async def get_cricket_scores(self) -> Dict[str, Any]:
        """Get cricket scores (live, fixtures, results)"""
        try:
            data = await self._make_request("cricScore")
            return data if data else {}
            
        except Exception as e:
            logger.error(f"Failed to get cricket scores: {str(e)}")
            return {}  # Return empty dict on error, don't raise

# Global instance
cricket_api = CricketAPIClient()