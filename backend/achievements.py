from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel

class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    category: str
    points: int
    unlocked_at: Optional[datetime] = None
    progress_current: int = 0
    progress_required: int = 1

class AchievementManager:
    def __init__(self):
        self.achievements_config = [
            {
                "id": "first_bid",
                "title": "First Bid",
                "description": "Place your first bid in any auction",
                "icon": "🎯",
                "category": "beginner",
                "points": 10,
                "progress_required": 1
            },
            {
                "id": "auction_winner",
                "title": "Auction Winner",
                "description": "Win your first player auction",
                "icon": "🏆",
                "category": "achievement",
                "points": 50,
                "progress_required": 1
            },
            {
                "id": "big_spender",
                "title": "Big Spender",
                "description": "Spend over $1M in a single auction",
                "icon": "💰",
                "category": "money",
                "points": 100,
                "progress_required": 1000000
            },
            {
                "id": "speed_bidder",
                "title": "Speed Bidder",
                "description": "Place 5 bids within 30 seconds",
                "icon": "⚡",
                "category": "activity",
                "points": 30,
                "progress_required": 5
            },
            {
                "id": "tournament_creator",
                "title": "Tournament Master",
                "description": "Create your first tournament",
                "icon": "🎪",
                "category": "social",
                "points": 25,
                "progress_required": 1
            },
            {
                "id": "social_butterfly",
                "title": "Social Butterfly",
                "description": "Invite 10 friends to tournaments",
                "icon": "🦋",
                "category": "social",
                "points": 75,
                "progress_required": 10
            },
            {
                "id": "cricket_expert",
                "title": "Cricket Expert",
                "description": "Participate in 20 auctions",
                "icon": "🏏",
                "category": "experience",
                "points": 150,
                "progress_required": 20
            },
            {
                "id": "team_builder",
                "title": "Team Builder",
                "description": "Win 5 different player auctions",
                "icon": "👥",
                "category": "achievement",
                "points": 200,
                "progress_required": 5
            },
            {
                "id": "legend",
                "title": "Legend",
                "description": "Win 3 tournament championships",
                "icon": "👑",
                "category": "legend",
                "points": 500,
                "progress_required": 3
            }
        ]
    
    async def check_achievements(self, user_id: str, action: str, data: dict, db) -> List[Achievement]:
        """Check if user has unlocked any new achievements"""
        newly_unlocked = []
        
        # Get user's current achievements
        user = await db.users.find_one({"id": user_id})
        if not user:
            return []
            
        user_achievements = user.get("achievements", [])
        
        for achievement_config in self.achievements_config:
            achievement_id = achievement_config["id"]
            
            # Skip if already unlocked
            if any(ach.get("id") == achievement_id for ach in user_achievements):
                continue
                
            # Check if achievement should be unlocked
            should_unlock = await self._check_achievement_condition(
                achievement_id, action, data, user_id, db
            )
            
            if should_unlock:
                achievement = Achievement(
                    **achievement_config,
                    unlocked_at=datetime.utcnow(),
                    progress_current=achievement_config["progress_required"]
                )
                
                # Add to user's achievements
                await db.users.update_one(
                    {"id": user_id},
                    {"$push": {"achievements": achievement.dict()}}
                )
                
                newly_unlocked.append(achievement)
                
        return newly_unlocked
    
    async def _check_achievement_condition(self, achievement_id: str, action: str, data: dict, user_id: str, db) -> bool:
        """Check specific achievement conditions"""
        if achievement_id == "first_bid" and action == "place_bid":
            return True
            
        elif achievement_id == "auction_winner" and action == "auction_won":
            return True
            
        elif achievement_id == "big_spender" and action == "place_bid":
            return data.get("amount", 0) >= 1000000
            
        elif achievement_id == "tournament_creator" and action == "create_tournament":
            return True
            
        elif achievement_id == "speed_bidder" and action == "place_bid":
            # Check if user placed 5 bids in last 30 seconds
            from datetime import timedelta
            thirty_seconds_ago = datetime.utcnow() - timedelta(seconds=30)
            recent_bids = await db.bids.count_documents({
                "user_id": user_id,
                "timestamp": {"$gte": thirty_seconds_ago}
            })
            return recent_bids >= 5
            
        elif achievement_id == "social_butterfly" and action == "invite_friend":
            # Count total invites sent
            invites_count = await db.tournament_invites.count_documents({"inviter_id": user_id})
            return invites_count >= 10
            
        elif achievement_id == "cricket_expert":
            # Count auction participations
            auction_count = await db.bids.distinct("auction_id", {"user_id": user_id})
            return len(auction_count) >= 20
            
        elif achievement_id == "team_builder" and action == "auction_won":
            # Count unique players won
            won_auctions = await db.auctions.count_documents({
                "highest_bidder_id": user_id,
                "is_active": False
            })
            return won_auctions >= 5
            
        elif achievement_id == "legend":
            # Count tournament wins
            tournaments_won = await db.tournaments.count_documents({
                "winner_id": user_id,
                "status": "completed"
            })
            return tournaments_won >= 3
            
        return False
    
    async def get_user_achievements(self, user_id: str, db) -> List[Achievement]:
        """Get all achievements for a user"""
        user = await db.users.find_one({"id": user_id})
        if not user:
            return []
            
        user_achievements = user.get("achievements", [])
        return [Achievement(**ach) for ach in user_achievements]
    
    async def get_achievement_progress(self, user_id: str, db) -> Dict[str, dict]:
        """Get progress towards all achievements"""
        progress = {}
        
        for achievement_config in self.achievements_config:
            achievement_id = achievement_config["id"]
            current_progress = await self._get_current_progress(achievement_id, user_id, db)
            
            progress[achievement_id] = {
                "title": achievement_config["title"],
                "description": achievement_config["description"],
                "icon": achievement_config["icon"],
                "current": current_progress,
                "required": achievement_config["progress_required"],
                "percentage": min(100, (current_progress / achievement_config["progress_required"]) * 100)
            }
            
        return progress
    
    async def _get_current_progress(self, achievement_id: str, user_id: str, db) -> int:
        """Get current progress for specific achievement"""
        if achievement_id == "first_bid":
            return await db.bids.count_documents({"user_id": user_id})
            
        elif achievement_id == "auction_winner":
            return await db.auctions.count_documents({
                "highest_bidder_id": user_id,
                "is_active": False
            })
            
        elif achievement_id == "tournament_creator":
            return await db.tournaments.count_documents({"admin_id": user_id})
            
        elif achievement_id == "cricket_expert":
            auction_ids = await db.bids.distinct("auction_id", {"user_id": user_id})
            return len(auction_ids)
            
        # Add more progress calculations as needed
        return 0

# Global achievement manager instance
achievement_manager = AchievementManager()