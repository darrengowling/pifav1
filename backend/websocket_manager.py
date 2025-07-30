import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.auction_participants: Dict[str, Set[str]] = {}  # auction_id -> set of user_ids
        self.user_auctions: Dict[str, str] = {}  # user_id -> auction_id
        
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected via WebSocket")
        
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            
        # Remove from auction participants
        for auction_id, participants in self.auction_participants.items():
            participants.discard(user_id)
            
        if user_id in self.user_auctions:
            del self.user_auctions[user_id]
            
        logger.info(f"User {user_id} disconnected from WebSocket")
        
    async def join_auction(self, user_id: str, auction_id: str, username: str):
        """Add user to auction room"""
        if auction_id not in self.auction_participants:
            self.auction_participants[auction_id] = set()
            
        self.auction_participants[auction_id].add(user_id)
        self.user_auctions[user_id] = auction_id
        
        # Notify all participants in the auction
        await self.broadcast_to_auction(auction_id, {
            "type": "user_joined",
            "user_id": user_id,
            "username": username,
            "timestamp": datetime.utcnow().isoformat(),
            "participants_count": len(self.auction_participants[auction_id])
        })
        
    async def leave_auction(self, user_id: str, username: str):
        """Remove user from auction room"""
        if user_id in self.user_auctions:
            auction_id = self.user_auctions[user_id]
            
            if auction_id in self.auction_participants:
                self.auction_participants[auction_id].discard(user_id)
                
            del self.user_auctions[user_id]
            
            # Notify remaining participants
            await self.broadcast_to_auction(auction_id, {
                "type": "user_left",
                "user_id": user_id,
                "username": username,
                "timestamp": datetime.utcnow().isoformat(),
                "participants_count": len(self.auction_participants.get(auction_id, []))
            })
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast_to_auction(self, auction_id: str, message: dict):
        """Broadcast message to all participants in an auction"""
        if auction_id not in self.auction_participants:
            return
            
        participants = self.auction_participants[auction_id].copy()
        disconnected_users = []
        
        for user_id in participants:
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to user {user_id}: {e}")
                    disconnected_users.append(user_id)
                    
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)
    
    async def broadcast_bid_update(self, auction_id: str, bid_data: dict):
        """Broadcast new bid to all auction participants"""
        message = {
            "type": "bid_update",
            "auction_id": auction_id,
            "bid": bid_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_auction(auction_id, message)
        
    async def broadcast_auction_status(self, auction_id: str, status: str, data: dict = None):
        """Broadcast auction status changes"""
        message = {
            "type": "auction_status",
            "auction_id": auction_id,
            "status": status,
            "data": data or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_auction(auction_id, message)
        
    async def send_notification(self, user_id: str, notification: dict):
        """Send notification to specific user"""
        message = {
            "type": "notification",
            "notification": notification,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
        
    def get_auction_participants_count(self, auction_id: str) -> int:
        """Get number of participants in an auction"""
        return len(self.auction_participants.get(auction_id, []))
        
    def get_online_users_count(self) -> int:
        """Get total number of online users"""
        return len(self.active_connections)

# Global connection manager instance
manager = ConnectionManager()