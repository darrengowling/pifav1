import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from cricket_models import CricketPlayer, PlayerCareerSummary, BattingStats, BowlingStats, MatchFormat, PlayerRole
from cricket_api_client import cricket_api, CricketAPIError

logger = logging.getLogger(__name__)

class CricketService:
    
    async def get_player_by_name(self, player_name: str) -> Optional[CricketPlayer]:
        """Get player data from Cricket API"""
        try:
            # Fetch from API
            api_data = await cricket_api.get_player_stats(player_name)
            if not api_data:
                return None
            
            # Check if API returned an error response
            if isinstance(api_data, dict):
                # Check for API error responses
                if api_data.get('status') == 'failure':
                    logger.warning(f"API returned failure for player {player_name}: {api_data.get('reason', 'Unknown error')}")
                    return None
                
                # Check if this is an empty/invalid response
                if not api_data.get("Player Name") and not api_data.get("name"):
                    logger.warning(f"No valid player data found for {player_name}")
                    return None
            
            # Transform API data to our model
            player = self._transform_player_data(api_data)
            
            # Additional validation - if player name is still "Unknown", it means transformation failed
            if player and player.name == "Unknown":
                logger.warning(f"Player transformation resulted in 'Unknown' name for {player_name}")
                return None
            
            logger.info(f"Player fetched from API: {player_name}")
            return player
            
        except CricketAPIError as e:
            logger.error(f"API error fetching player {player_name}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching player {player_name}: {str(e)}")
            return None
    
    def _transform_player_data(self, api_data: Dict[str, Any]) -> CricketPlayer:
        """Transform API response to CricketPlayer model"""
        try:
            career_summaries = []
            
            # Process batting career summaries
            for key, value in api_data.items():
                if key.startswith("Batting Career Summary") and isinstance(value, dict):
                    format_name = value.get("Mode1") or value.get("Mode2") or value.get("format", "T20")
                    
                    # Map format names
                    format_mapping = {
                        "Test": MatchFormat.TEST,
                        "ODI": MatchFormat.ODI,
                        "T20I": MatchFormat.T20I,
                        "T20": MatchFormat.T20,
                        "IPL": MatchFormat.IPL
                    }
                    
                    match_format = format_mapping.get(format_name, MatchFormat.T20)
                    
                    batting_stats = BattingStats(
                        matches=self._safe_int(value.get("Matches")),
                        runs=self._safe_int(value.get("Runs")),
                        highest_score=value.get("HS"),
                        average=value.get("Avg"),
                        strike_rate=value.get("SR"),
                        centuries=self._safe_int(value.get("100s")),
                        half_centuries=self._safe_int(value.get("50s"))
                    )
                    
                    career_summaries.append(PlayerCareerSummary(
                        format=match_format,
                        batting=batting_stats
                    ))
            
            # If no career summaries found, create a default one
            if not career_summaries:
                career_summaries.append(PlayerCareerSummary(
                    format=MatchFormat.T20,
                    batting=BattingStats()
                ))
            
            # Determine player role based on stats
            role = self._determine_player_role(career_summaries)
            
            return CricketPlayer(
                name=api_data.get("Player Name") or api_data.get("name", "Unknown"),
                country=api_data.get("Country") or api_data.get("country"),
                role=role,
                career_summaries=career_summaries,
                base_price=self._generate_base_price(career_summaries, role)
            )
            
        except Exception as e:
            logger.error(f"Failed to transform player data: {str(e)}")
            # Return a basic player model on transformation error
            return CricketPlayer(
                name=api_data.get("Player Name") or api_data.get("name", "Unknown"),
                country=api_data.get("Country") or api_data.get("country"),
                role=PlayerRole.BATSMAN,
                career_summaries=[],
                base_price=100000.0
            )
    
    def _safe_int(self, value: Any) -> Optional[int]:
        """Safely convert value to integer"""
        if value is None or value == '-' or value == '':
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            return None
    
    def _determine_player_role(self, career_summaries: List[PlayerCareerSummary]) -> PlayerRole:
        """Determine player role based on career statistics"""
        total_runs = 0
        total_wickets = 0
        
        for summary in career_summaries:
            if summary.batting:
                total_runs += summary.batting.runs or 0
            if summary.bowling:
                total_wickets += summary.bowling.wickets or 0
        
        # Simple heuristic for role determination
        if total_runs > 1000 and total_wickets > 50:
            return PlayerRole.ALL_ROUNDER
        elif total_runs > 1000:
            return PlayerRole.BATSMAN
        elif total_wickets > 50:
            return PlayerRole.BOWLER
        else:
            return PlayerRole.BATSMAN  # Default
    
    def _generate_base_price(self, career_summaries: List[PlayerCareerSummary], role: PlayerRole) -> float:
        """Generate base auction price based on player stats"""
        base_price = 100000  # Minimum base price
        
        for summary in career_summaries:
            if summary.batting:
                runs = summary.batting.runs or 0
                average = summary.batting.average or 0
                
                # Add price based on runs and average
                base_price += min(runs * 10, 500000)  # Max 500k from runs
                base_price += min(average * 5000, 200000)  # Max 200k from average
            
            if summary.bowling:
                wickets = summary.bowling.wickets or 0
                economy = summary.bowling.economy or 10
                
                # Add price based on wickets and economy
                base_price += min(wickets * 1000, 300000)  # Max 300k from wickets
                if economy < 8:  # Good economy rate
                    base_price += 100000
        
        # Role-based adjustments
        if role == PlayerRole.ALL_ROUNDER:
            base_price *= 1.2
        elif role == PlayerRole.WICKET_KEEPER:
            base_price *= 1.1
        
        return min(max(base_price, 100000), 2000000)  # Between 100k and 2M
    
    async def search_famous_cricket_players(self) -> List[str]:
        """Get list of famous cricket players for auction"""
        return [
            "Virat Kohli",
            "Rohit Sharma", 
            "MS Dhoni",
            "Hardik Pandya",
            "Jasprit Bumrah",
            "KL Rahul",
            "Rishabh Pant",
            "Ravindra Jadeja",
            "Mohammed Shami",
            "Shikhar Dhawan",
            "Jos Buttler",
            "Ben Stokes",
            "David Warner",
            "Steve Smith",
            "Pat Cummins",
            "AB de Villiers",
            "Faf du Plessis",
            "Kagiso Rabada",
            "Quinton de Kock",
            "Babar Azam",
            "Shaheen Afridi",
            "Kane Williamson",
            "Trent Boult",
            "Rashid Khan",
            "Andre Russell",
            "Chris Gayle",
            "Kieron Pollard",
            "Sunil Narine",
            "Dwayne Bravo",
            "Nicholas Pooran"
        ]
    
    async def get_live_matches(self) -> List[Dict[str, Any]]:
        """Get current live matches"""
        try:
            return await cricket_api.get_live_matches()
        except Exception as e:
            logger.error(f"Failed to get live matches: {str(e)}")
            return []
    
    async def get_match_schedule(self) -> List[Dict[str, Any]]:
        """Get upcoming match schedule"""
        try:
            return await cricket_api.get_match_schedule()
        except Exception as e:
            logger.error(f"Failed to get match schedule: {str(e)}")
            return []
    
    async def get_cricket_scores(self) -> Dict[str, Any]:
        """Get comprehensive cricket scores"""
        try:
            return await cricket_api.get_cricket_scores()
        except Exception as e:
            logger.error(f"Failed to get cricket scores: {str(e)}")
            return {}

# Global service instance
cricket_service = CricketService()