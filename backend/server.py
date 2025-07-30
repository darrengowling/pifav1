from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SportX Cricket Auction API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Enums
class TournamentStatus(str, Enum):
    DRAFT = "draft"
    SETUP = "setup"
    AUCTION_SCHEDULED = "auction_scheduled"
    AUCTION_LIVE = "auction_live"
    ACTIVE = "active"
    COMPLETED = "completed"

class PlayerPosition(str, Enum):
    BATSMAN = "Batsman"
    BOWLER = "Bowler"
    ALL_ROUNDER = "All Rounder"
    WICKET_KEEPER = "Wicket Keeper"

class InviteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    avatar: Optional[str] = None
    credits: int = 0
    leagues_won: int = 0
    total_spent: int = 0

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    avatar: Optional[str] = None
    credits: int
    leagues_won: int
    total_spent: int
    created_at: datetime

class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    sport: str = "cricket"
    position: PlayerPosition
    rating: int
    price: int
    image: Optional[str] = None
    stats: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PlayerCreate(BaseModel):
    name: str
    position: PlayerPosition
    rating: int
    price: int
    image: Optional[str] = None
    stats: Dict[str, Any]

class SquadComposition(BaseModel):
    batsmen: int
    bowlers: int
    all_rounders: int
    wicket_keepers: int

class TournamentParticipant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    budget: int
    current_budget: int
    squad: List[str] = []  # Player IDs
    total_score: int = 0
    is_admin: bool = False
    invite_status: InviteStatus = InviteStatus.PENDING

class Tournament(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    sport: str = "cricket"
    real_life_tournament: str
    admin_id: str
    participants: List[TournamentParticipant] = []
    max_participants: int
    status: TournamentStatus = TournamentStatus.DRAFT
    budget: int
    squad_composition: SquadComposition
    auction_date: Optional[datetime] = None
    auction_duration: float = 2.0  # hours
    created_at: datetime = Field(default_factory=datetime.utcnow)
    invite_code: Optional[str] = None

class TournamentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    real_life_tournament: str
    max_participants: int
    budget: int
    squad_composition: SquadComposition
    auction_date: Optional[datetime] = None
    auction_duration: float = 2.0

class TournamentJoin(BaseModel):
    invite_code: str

class Auction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tournament_id: str
    player_id: str
    current_bid: int
    highest_bidder_id: Optional[str] = None
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    is_active: bool = True
    min_increment: int = 25000

class AuctionCreate(BaseModel):
    tournament_id: str
    player_id: str
    duration_minutes: int = 180

class Bid(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    auction_id: str
    user_id: str
    username: str
    amount: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_winning: bool = False

class BidCreate(BaseModel):
    amount: int

# Default cricket players data
CRICKET_PLAYERS = [
    {
        "id": "1", "name": "Virat Kohli", "position": "Batsman", "rating": 95, "price": 850000,
        "stats": {"runs": 12000, "average": 59.07, "centuries": 70, "matches": 254}
    },
    {
        "id": "2", "name": "MS Dhoni", "position": "Wicket Keeper", "rating": 92, "price": 750000,
        "stats": {"runs": 10500, "sixes": 229, "matches": 350, "dismissals": 444}
    },
    {
        "id": "3", "name": "Rohit Sharma", "position": "Batsman", "rating": 91, "price": 680000,
        "stats": {"runs": 9500, "average": 48.96, "doublecenturies": 3, "matches": 243}
    },
    {
        "id": "4", "name": "Jasprit Bumrah", "position": "Bowler", "rating": 94, "price": 720000,
        "stats": {"wickets": 130, "economy": 4.2, "average": 24.5, "matches": 72}
    },
    {
        "id": "5", "name": "KL Rahul", "position": "Wicket Keeper", "rating": 88, "price": 580000,
        "stats": {"runs": 8000, "average": 47.1, "strikerate": 135.2, "matches": 148}
    },
    {
        "id": "6", "name": "Hardik Pandya", "position": "All Rounder", "rating": 90, "price": 650000,
        "stats": {"runs": 4500, "wickets": 85, "sixes": 156, "matches": 125}
    },
    {
        "id": "7", "name": "Rishabh Pant", "position": "Wicket Keeper", "rating": 89, "price": 620000,
        "stats": {"runs": 6800, "average": 43.5, "sixes": 98, "matches": 87}
    },
    {
        "id": "8", "name": "Ravindra Jadeja", "position": "All Rounder", "rating": 88, "price": 590000,
        "stats": {"runs": 5500, "wickets": 220, "catches": 157, "matches": 168}
    },
    {
        "id": "9", "name": "Shikhar Dhawan", "position": "Batsman", "rating": 85, "price": 480000,
        "stats": {"runs": 7200, "average": 45.1, "centuries": 17, "matches": 167}
    },
    {
        "id": "10", "name": "Mohammed Shami", "position": "Bowler", "rating": 87, "price": 520000,
        "stats": {"wickets": 180, "economy": 5.1, "average": 28.5, "matches": 87}
    },
    {
        "id": "11", "name": "AB de Villiers", "position": "Batsman", "rating": 93, "price": 780000,
        "stats": {"runs": 9577, "average": 53.5, "centuries": 25, "strikerate": 101.1}
    },
    {
        "id": "12", "name": "Jos Buttler", "position": "Wicket Keeper", "rating": 90, "price": 640000,
        "stats": {"runs": 4500, "strikerate": 140.2, "sixes": 178, "matches": 162}
    },
    {
        "id": "13", "name": "David Warner", "position": "Batsman", "rating": 89, "price": 610000,
        "stats": {"runs": 5455, "average": 48.8, "centuries": 18, "matches": 112}
    },
    {
        "id": "14", "name": "Kagiso Rabada", "position": "Bowler", "rating": 91, "price": 670000,
        "stats": {"wickets": 252, "economy": 4.3, "average": 22.9, "matches": 57}
    },
    {
        "id": "15", "name": "Rashid Khan", "position": "Bowler", "rating": 92, "price": 700000,
        "stats": {"wickets": 170, "economy": 6.2, "average": 18.4, "matches": 76}
    },
    {
        "id": "16", "name": "Andre Russell", "position": "All Rounder", "rating": 87, "price": 550000,
        "stats": {"runs": 1800, "wickets": 65, "strikerate": 177.9, "sixes": 120}
    },
    {
        "id": "17", "name": "Chris Gayle", "position": "Batsman", "rating": 84, "price": 460000,
        "stats": {"runs": 14562, "sixes": 553, "centuries": 42, "strikerate": 137.5}
    },
    {
        "id": "18", "name": "Trent Boult", "position": "Bowler", "rating": 88, "price": 560000,
        "stats": {"wickets": 311, "economy": 4.9, "average": 27.5, "matches": 93}
    },
    {
        "id": "19", "name": "Ben Stokes", "position": "All Rounder", "rating": 90, "price": 650000,
        "stats": {"runs": 2919, "wickets": 42, "average": 35.4, "matches": 105}
    },
    {
        "id": "20", "name": "Sunil Narine", "position": "All Rounder", "rating": 85, "price": 490000,
        "stats": {"runs": 1025, "wickets": 152, "economy": 6.7, "strikerate": 168.3}
    }
]

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def generate_invite_code() -> str:
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Initialize database with cricket players
async def init_db():
    # Check if players collection is empty
    player_count = await db.players.count_documents({})
    if player_count == 0:
        # Insert default cricket players
        players = [Player(**player_data) for player_data in CRICKET_PLAYERS]
        player_dicts = [player.dict() for player in players]
        await db.players.insert_many(player_dicts)
        logger.info(f"Inserted {len(players)} cricket players into database")

# Routes
@api_router.get("/")
async def root():
    return {"message": "SportX Cricket Auction API", "version": "1.0.0"}

# Authentication routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    return UserResponse(**user.dict())

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(**user)}

@api_router.get("/auth/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

# Player routes
@api_router.get("/players", response_model=List[Player])
async def get_players(position: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if position:
        query["position"] = position
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"position": {"$regex": search, "$options": "i"}}
        ]
    
    players = await db.players.find(query).to_list(100)
    return [Player(**player) for player in players]

@api_router.get("/players/{player_id}", response_model=Player)
async def get_player(player_id: str):
    player = await db.players.find_one({"id": player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return Player(**player)

@api_router.post("/players", response_model=Player)
async def create_player(player_data: PlayerCreate, current_user: User = Depends(get_current_user)):
    player = Player(**player_data.dict())
    await db.players.insert_one(player.dict())
    return player

# Tournament routes
@api_router.get("/tournaments", response_model=List[Tournament])
async def get_tournaments(status: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"real_life_tournament": {"$regex": search, "$options": "i"}}
        ]
    
    tournaments = await db.tournaments.find(query).to_list(100)
    return [Tournament(**tournament) for tournament in tournaments]

@api_router.get("/tournaments/{tournament_id}", response_model=Tournament)
async def get_tournament(tournament_id: str):
    tournament = await db.tournaments.find_one({"id": tournament_id})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return Tournament(**tournament)

@api_router.post("/tournaments", response_model=Tournament)
async def create_tournament(tournament_data: TournamentCreate, current_user: User = Depends(get_current_user)):
    tournament = Tournament(
        **tournament_data.dict(),
        admin_id=current_user.id,
        invite_code=generate_invite_code()
    )
    
    # Add creator as first participant
    admin_participant = TournamentParticipant(
        user_id=current_user.id,
        username=current_user.username,
        budget=tournament.budget,
        current_budget=tournament.budget,
        is_admin=True,
        invite_status=InviteStatus.ACCEPTED
    )
    tournament.participants.append(admin_participant)
    tournament.status = TournamentStatus.SETUP
    
    await db.tournaments.insert_one(tournament.dict())
    return tournament

@api_router.post("/tournaments/{tournament_id}/join", response_model=Tournament)
async def join_tournament(tournament_id: str, join_data: TournamentJoin, current_user: User = Depends(get_current_user)):
    tournament = await db.tournaments.find_one({"id": tournament_id})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament_obj = Tournament(**tournament)
    
    # Check invite code
    if tournament_obj.invite_code != join_data.invite_code:
        raise HTTPException(status_code=400, detail="Invalid invite code")
    
    # Check if already joined
    for participant in tournament_obj.participants:
        if participant.user_id == current_user.id:
            raise HTTPException(status_code=400, detail="Already joined tournament")
    
    # Check if tournament is full
    if len(tournament_obj.participants) >= tournament_obj.max_participants:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    # Add participant
    participant = TournamentParticipant(
        user_id=current_user.id,
        username=current_user.username,
        budget=tournament_obj.budget,
        current_budget=tournament_obj.budget,
        invite_status=InviteStatus.ACCEPTED
    )
    tournament_obj.participants.append(participant)
    
    await db.tournaments.update_one(
        {"id": tournament_id},
        {"$set": {"participants": [p.dict() for p in tournament_obj.participants]}}
    )
    
    return tournament_obj

# Auction routes
@api_router.get("/auctions", response_model=List[Auction])
async def get_auctions(tournament_id: Optional[str] = None, is_active: Optional[bool] = None):
    query = {}
    if tournament_id:
        query["tournament_id"] = tournament_id
    if is_active is not None:
        query["is_active"] = is_active
    
    auctions = await db.auctions.find(query).to_list(100)
    return [Auction(**auction) for auction in auctions]

@api_router.get("/auctions/{auction_id}", response_model=Auction)
async def get_auction(auction_id: str):
    auction = await db.auctions.find_one({"id": auction_id})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return Auction(**auction)

@api_router.post("/auctions", response_model=Auction)
async def create_auction(auction_data: AuctionCreate, current_user: User = Depends(get_current_user)):
    # Verify tournament exists and user is admin
    tournament = await db.tournaments.find_one({"id": auction_data.tournament_id})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament_obj = Tournament(**tournament)
    if tournament_obj.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only tournament admin can create auctions")
    
    # Get player
    player = await db.players.find_one({"id": auction_data.player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    auction = Auction(
        tournament_id=auction_data.tournament_id,
        player_id=auction_data.player_id,
        current_bid=player["price"],
        end_time=datetime.utcnow() + timedelta(minutes=auction_data.duration_minutes)
    )
    
    await db.auctions.insert_one(auction.dict())
    return auction

@api_router.post("/auctions/{auction_id}/bid", response_model=Bid)
async def place_bid(auction_id: str, bid_data: BidCreate, current_user: User = Depends(get_current_user)):
    auction = await db.auctions.find_one({"id": auction_id})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    auction_obj = Auction(**auction)
    
    # Check if auction is active
    if not auction_obj.is_active:
        raise HTTPException(status_code=400, detail="Auction is not active")
    
    # Check if auction has ended
    if auction_obj.end_time and datetime.utcnow() > auction_obj.end_time:
        raise HTTPException(status_code=400, detail="Auction has ended")
    
    # Check minimum bid
    min_bid = auction_obj.current_bid + auction_obj.min_increment
    if bid_data.amount < min_bid:
        raise HTTPException(status_code=400, detail=f"Minimum bid is ${min_bid}")
    
    # Create bid
    bid = Bid(
        auction_id=auction_id,
        user_id=current_user.id,
        username=current_user.username,
        amount=bid_data.amount,
        is_winning=True
    )
    
    # Update previous bids to not winning
    await db.bids.update_many(
        {"auction_id": auction_id},
        {"$set": {"is_winning": False}}
    )
    
    # Insert new bid
    await db.bids.insert_one(bid.dict())
    
    # Update auction
    await db.auctions.update_one(
        {"id": auction_id},
        {"$set": {
            "current_bid": bid_data.amount,
            "highest_bidder_id": current_user.id
        }}
    )
    
    return bid

@api_router.get("/auctions/{auction_id}/bids", response_model=List[Bid])
async def get_auction_bids(auction_id: str):
    bids = await db.bids.find({"auction_id": auction_id}).sort("timestamp", -1).to_list(100)
    return [Bid(**bid) for bid in bids]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_db()
    logger.info("SportX Cricket Auction API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
