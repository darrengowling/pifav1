import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from websocket_manager import manager

logger = logging.getLogger(__name__)

class AuctionTimer:
    def __init__(self):
        self.active_timers: Dict[str, asyncio.Task] = {}
        self.auction_data: Dict[str, dict] = {}
        
    async def start_auction_timer(self, auction_id: str, duration_seconds: int, db):
        """Start countdown timer for an auction"""
        if auction_id in self.active_timers:
            self.active_timers[auction_id].cancel()
            
        self.auction_data[auction_id] = {
            "duration": duration_seconds,
            "start_time": datetime.utcnow(),
            "end_time": datetime.utcnow() + timedelta(seconds=duration_seconds),
            "is_active": True
        }
        
        # Start the timer task
        task = asyncio.create_task(self._run_timer(auction_id, duration_seconds, db))
        self.active_timers[auction_id] = task
        
        logger.info(f"Started timer for auction {auction_id} - {duration_seconds} seconds")
        
    async def extend_auction_timer(self, auction_id: str, additional_seconds: int):
        """Extend auction timer (e.g., when new bid is placed)"""
        if auction_id in self.auction_data:
            current_data = self.auction_data[auction_id]
            current_data["end_time"] += timedelta(seconds=additional_seconds)
            current_data["duration"] += additional_seconds
            
            # Broadcast timer update
            await manager.broadcast_to_auction(auction_id, {
                "type": "timer_extended",
                "auction_id": auction_id,
                "additional_seconds": additional_seconds,
                "new_end_time": current_data["end_time"].isoformat()
            })
            
            logger.info(f"Extended auction {auction_id} by {additional_seconds} seconds")
            
    async def _run_timer(self, auction_id: str, duration_seconds: int, db):
        """Run the countdown timer and broadcast updates"""
        try:
            remaining = duration_seconds
            
            while remaining > 0 and auction_id in self.auction_data:
                # Broadcast time remaining every 5 seconds, or every second in final 10 seconds
                broadcast_interval = 1 if remaining <= 10 else 5
                
                await manager.broadcast_to_auction(auction_id, {
                    "type": "timer_update",
                    "auction_id": auction_id,
                    "time_remaining": remaining,
                    "total_duration": duration_seconds
                })
                
                # Special notifications
                if remaining == 30:
                    await manager.broadcast_to_auction(auction_id, {
                        "type": "timer_warning",
                        "message": "30 seconds remaining!",
                        "auction_id": auction_id
                    })
                elif remaining == 10:
                    await manager.broadcast_to_auction(auction_id, {
                        "type": "timer_final_warning",
                        "message": "Final 10 seconds!",
                        "auction_id": auction_id
                    })
                
                await asyncio.sleep(broadcast_interval)
                remaining -= broadcast_interval
                
            # Auction ended
            await self._end_auction(auction_id, db)
            
        except asyncio.CancelledError:
            logger.info(f"Timer for auction {auction_id} was cancelled")
        except Exception as e:
            logger.error(f"Error in auction timer for {auction_id}: {e}")
            
    async def _end_auction(self, auction_id: str, db):
        """End the auction and determine winner"""
        try:
            # Get auction data from database
            auction = await db.auctions.find_one({"id": auction_id})
            if not auction:
                return
                
            # Get highest bid
            highest_bid = await db.bids.find_one(
                {"auction_id": auction_id, "is_winning": True}
            )
            
            winner_data = None
            if highest_bid:
                winner_data = {
                    "user_id": highest_bid["user_id"],
                    "username": highest_bid["username"],
                    "winning_bid": highest_bid["amount"]
                }
            
            # Update auction status
            await db.auctions.update_one(
                {"id": auction_id},
                {"$set": {
                    "is_active": False,
                    "end_time": datetime.utcnow(),
                    "winner_id": winner_data["user_id"] if winner_data else None,
                    "final_price": winner_data["winning_bid"] if winner_data else auction["current_bid"]
                }}
            )
            
            # Broadcast auction end
            await manager.broadcast_auction_status(auction_id, "ended", {
                "winner": winner_data,
                "final_price": winner_data["winning_bid"] if winner_data else auction["current_bid"]
            })
            
            # Clean up
            if auction_id in self.active_timers:
                del self.active_timers[auction_id]
            if auction_id in self.auction_data:
                del self.auction_data[auction_id]
                
            logger.info(f"Auction {auction_id} ended. Winner: {winner_data}")
            
        except Exception as e:
            logger.error(f"Error ending auction {auction_id}: {e}")
            
    def stop_auction_timer(self, auction_id: str):
        """Stop auction timer manually"""
        if auction_id in self.active_timers:
            self.active_timers[auction_id].cancel()
            del self.active_timers[auction_id]
            
        if auction_id in self.auction_data:
            del self.auction_data[auction_id]
            
        logger.info(f"Stopped timer for auction {auction_id}")
        
    def get_time_remaining(self, auction_id: str) -> Optional[int]:
        """Get remaining time for an auction"""
        if auction_id in self.auction_data:
            end_time = self.auction_data[auction_id]["end_time"]
            remaining = (end_time - datetime.utcnow()).total_seconds()
            return max(0, int(remaining))
        return None

# Global auction timer instance
auction_timer = AuctionTimer()