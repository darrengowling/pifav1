from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class MatchFormat(str, Enum):
    TEST = "Test"
    ODI = "ODI"
    T20I = "T20I"
    IPL = "IPL"
    T20 = "T20"

class PlayerRole(str, Enum):
    BATSMAN = "Batsman"
    BOWLER = "Bowler"
    ALL_ROUNDER = "All-rounder"
    WICKET_KEEPER = "Wicket-keeper"

class BattingStats(BaseModel):
    matches: Optional[int] = Field(None, description="Number of matches played")
    runs: Optional[int] = Field(None, description="Total runs scored")
    highest_score: Optional[str] = Field(None, description="Highest individual score")
    average: Optional[float] = Field(None, description="Batting average")
    strike_rate: Optional[float] = Field(None, description="Strike rate")
    centuries: Optional[int] = Field(None, description="Number of centuries")
    half_centuries: Optional[int] = Field(None, description="Number of half-centuries")
    
    @validator('average', 'strike_rate', pre=True)
    def parse_float(cls, v):
        if isinstance(v, str):
            try:
                return float(v) if v != '-' else None
            except ValueError:
                return None
        return v

class BowlingStats(BaseModel):
    matches: Optional[int] = Field(None, description="Number of matches played")
    wickets: Optional[int] = Field(None, description="Total wickets taken")
    best_figures: Optional[str] = Field(None, description="Best bowling figures")
    average: Optional[float] = Field(None, description="Bowling average")
    economy: Optional[float] = Field(None, description="Economy rate")
    
    @validator('average', 'economy', pre=True)
    def parse_float(cls, v):
        if isinstance(v, str):
            try:
                return float(v) if v != '-' else None
            except ValueError:
                return None
        return v

class PlayerCareerSummary(BaseModel):
    format: MatchFormat = Field(..., description="Match format")
    batting: Optional[BattingStats] = Field(None, description="Batting statistics")
    bowling: Optional[BowlingStats] = Field(None, description="Bowling statistics")

class CricketPlayer(BaseModel):
    id: Optional[str] = Field(None, description="Internal player ID")
    name: str = Field(..., description="Player full name")
    country: Optional[str] = Field(None, description="Country of origin")
    role: Optional[PlayerRole] = Field(None, description="Player role/position")
    career_summaries: List[PlayerCareerSummary] = Field(default_factory=list, description="Career statistics by format")
    
    # Additional fields for auction platform
    base_price: Optional[float] = Field(None, description="Base auction price")
    current_price: Optional[float] = Field(None, description="Current auction price")
    is_sold: bool = Field(default=False, description="Whether player is sold")
    team_id: Optional[str] = Field(None, description="Assigned team ID")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        use_enum_values = True

class MatchTeam(BaseModel):
    name: str = Field(..., description="Team name")
    score: Optional[str] = Field(None, description="Team score")
    overs: Optional[str] = Field(None, description="Overs played")

class CricketMatch(BaseModel):
    id: Optional[str] = Field(None, description="Internal match ID")
    external_id: Optional[str] = Field(None, description="External API match ID")
    teams: List[MatchTeam] = Field(..., description="Participating teams")
    status: str = Field(..., description="Match status")
    format: Optional[MatchFormat] = Field(None, description="Match format")
    venue: Optional[str] = Field(None, description="Match venue")
    date: Optional[datetime] = Field(None, description="Match date")
    result: Optional[str] = Field(None, description="Match result")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        use_enum_values = True