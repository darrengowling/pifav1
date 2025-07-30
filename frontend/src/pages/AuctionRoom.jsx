import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { cricketPlayers } from "../data/cricketPlayers";
import { 
  Clock, 
  Gavel, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap,
  AlertCircle,
  ChevronUp,
  Timer,
  Trophy,
  Target,
  ArrowLeft
} from "lucide-react";

const AuctionRoom = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  
  // Find the player data
  const player = cricketPlayers.find(p => p.id === playerId);
  
  // Auction state
  const [currentBid, setCurrentBid] = useState(player?.price || 500000);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isActive, setIsActive] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  
  // Participants and bids
  const [participants] = useState([
    {
      id: "1",
      username: "CricketKing",
      avatar: "",
      remainingBudget: 850000,
      totalSpent: 150000,
      isOnline: true,
      lastBid: currentBid
    },
    {
      id: "2", 
      username: "You",
      avatar: "",
      remainingBudget: 920000,
      totalSpent: 80000,
      isOnline: true
    },
    {
      id: "3",
      username: "SportsFan123",
      avatar: "",
      remainingBudget: 670000,
      totalSpent: 330000,
      isOnline: true
    },
    {
      id: "4",
      username: "IPLExpert",
      avatar: "",
      remainingBudget: 780000,
      totalSpent: 220000,
      isOnline: false
    },
    {
      id: "5",
      username: "CricketPro",
      avatar: "",
      remainingBudget: 890000,
      totalSpent: 110000,
      isOnline: true
    }
  ]);

  const [bidHistory, setBidHistory] = useState([
    {
      id: "1",
      userId: "1",
      username: "CricketKing",
      amount: currentBid,
      timestamp: new Date(Date.now() - 30000),
      isWinning: true
    },
    {
      id: "2",
      userId: "3",
      username: "SportsFan123", 
      amount: currentBid - 25000,
      timestamp: new Date(Date.now() - 45000),
      isWinning: false
    }
  ]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          alert("Auction ended! 🏆");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // Simulate random bids from other participants
  useEffect(() => {
    if (!isActive) return;

    const bidInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 3 seconds
        const randomParticipant = participants[Math.floor(Math.random() * (participants.length - 1))];
        if (randomParticipant.id !== "2" && randomParticipant.isOnline) {
          const newBidAmount = currentBid + (Math.floor(Math.random() * 3) + 1) * 25000;
          
          if (newBidAmount <= randomParticipant.remainingBudget) {
            simulateBid(randomParticipant, newBidAmount);
          }
        }
      }
    }, 3000);

    return () => clearInterval(bidInterval);
  }, [isActive, currentBid, participants]);

  const simulateBid = (participant, amount) => {
    const newBid = {
      id: Date.now().toString(),
      userId: participant.id,
      username: participant.username,
      amount,
      timestamp: new Date(),
      isWinning: true
    };

    setBidHistory(prev => {
      const updated = prev.map(bid => ({ ...bid, isWinning: false }));
      return [newBid, ...updated].slice(0, 10);
    });

    setCurrentBid(amount);
    setTimeLeft(Math.min(timeLeft + 30, 180)); // Add 30 seconds, max 3 minutes
    
    alert(`${participant.username} bid $${amount.toLocaleString()}! 🎯`);
  };

  const placeBid = useCallback(() => {
    const amount = parseInt(bidAmount);
    const minBid = currentBid + 25000;
    const myBudget = participants.find(p => p.id === "2")?.remainingBudget || 0;

    if (!amount || amount < minBid) {
      alert(`Minimum bid is $${minBid.toLocaleString()}`);
      return;
    }

    if (amount > myBudget) {
      alert("Insufficient budget!");
      return;
    }

    const newBid = {
      id: Date.now().toString(),
      userId: "2",
      username: "You",
      amount,
      timestamp: new Date(),
      isWinning: true
    };

    setBidHistory(prev => {
      const updated = prev.map(bid => ({ ...bid, isWinning: false }));
      return [newBid, ...updated].slice(0, 10);
    });

    setCurrentBid(amount);
    setTimeLeft(Math.min(timeLeft + 30, 180));
    setBidAmount("");
    
    alert(`Bid placed: $${amount.toLocaleString()}! 🚀`);
  }, [bidAmount, currentBid, timeLeft, participants]);

  const quickBid = (increment) => {
    const amount = currentBid + increment;
    const myBudget = participants.find(p => p.id === "2")?.remainingBudget || 0;
    
    if (amount > myBudget) {
      alert("Insufficient budget!");
      return;
    }
    
    setBidAmount(amount.toString());
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!player) {
    return (
      <div className="min-h-screen pt-20 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
          <p className="text-muted-foreground mb-4">The auction you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/auctions")}>Back to Auctions</Button>
        </div>
      </div>
    );
  }

  const currentWinner = bidHistory[0];
  const myBudget = participants.find(p => p.id === "2")?.remainingBudget || 0;
  const amIWinning = currentWinner?.userId === "2";

  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/auctions")}
            className="touch-target"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant={isActive ? "destructive" : "secondary"} className="animate-pulse">
            {isActive ? "LIVE AUCTION" : "ENDED"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Auction Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Card */}
            <Card className="overflow-hidden gradient-auction border-2 border-primary/20">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-bold">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{player.name}</h1>
                    <p className="text-muted-foreground">{player.position} • Rating: {player.rating}/100</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Base Price</div>
                    <div className="text-lg font-semibold">${player.price.toLocaleString()}</div>
                  </div>
                </div>

                {/* Player Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(player.stats).map(([key, value]) => (
                    <div key={key} className="text-center p-3 rounded-lg bg-muted/20">
                      <div className="font-bold text-lg">{value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Current Bid & Timer */}
            <Card className="p-6 border-2 border-success/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-success" />
                    <span className="text-sm text-muted-foreground">Current Bid</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-success mb-2">
                    ${currentBid.toLocaleString()}
                  </div>
                  {currentWinner && (
                    <div className="flex items-center gap-2">
                      <Badge variant={amIWinning ? "default" : "secondary"}>
                        {amIWinning ? "You're Winning!" : `${currentWinner.username} Leading`}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="text-center md:text-right">
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-end">
                    <Timer className="h-5 w-5 text-warning" />
                    <span className="text-sm text-muted-foreground">Time Remaining</span>
                  </div>
                  <div className={`text-4xl md:text-5xl font-bold mb-2 ${timeLeft <= 30 ? 'text-destructive animate-pulse' : 'text-warning'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(timeLeft / 180) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Bidding Controls */}
            {isActive && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Place Your Bid</h3>
                    <div className="text-sm text-muted-foreground">
                      Budget: <span className="font-semibold text-success">${myBudget.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Quick Bid Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => quickBid(25000)}
                      className="touch-target py-3 text-lg font-semibold hover:bg-primary/10 hover:border-primary transition-colors"
                      size="lg"
                    >
                      +$25K
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => quickBid(50000)}
                      className="touch-target py-3 text-lg font-semibold hover:bg-primary/10 hover:border-primary transition-colors"
                      size="lg"
                    >
                      +$50K
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => quickBid(100000)}
                      className="touch-target py-3 text-lg font-semibold hover:bg-primary/10 hover:border-primary transition-colors"
                      size="lg"
                    >
                      +$100K
                    </Button>
                  </div>

                  {/* Custom Bid Input */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder={`Min: $${(currentBid + 25000).toLocaleString()}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                    <Button 
                      onClick={placeBid}
                      className="touch-target px-8 py-3 text-lg font-semibold"
                      disabled={!bidAmount}
                      size="lg"
                    >
                      <Gavel className="h-5 w-5 mr-2" />
                      Place Bid
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    Minimum bid increment: $25,000
                  </div>
                </div>
              </Card>
            )}

            {/* Auction Ended */}
            {!isActive && (
              <Card className="p-6 text-center gradient-card">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-warning" />
                <h3 className="text-2xl font-bold mb-2">Auction Ended!</h3>
                <p className="text-muted-foreground mb-4">
                  {amIWinning ? 
                    `Congratulations! You won ${player.name} for $${currentBid.toLocaleString()}!` :
                    `${currentWinner?.username} won ${player.name} for $${currentBid.toLocaleString()}`
                  }
                </p>
                <Button onClick={() => navigate("/auctions")} className="touch-target">
                  View More Auctions
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.filter(p => p.isOnline).length} online)
              </h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {participant.username.slice(0, 2).toUpperCase()}
                      </div>
                      {participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {participant.username}
                        {participant.id === "2" && " (You)"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${participant.remainingBudget.toLocaleString()} left
                      </div>
                    </div>
                    {participant.lastBid && (
                      <Badge variant="outline" className="text-xs">
                        Last: ${(participant.lastBid / 1000)}K
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Bid History */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Bid History
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bidHistory.map((bid, index) => (
                  <div 
                    key={bid.id} 
                    className={`p-3 rounded-lg ${bid.isWinning ? 'bg-success/10 border border-success/20' : 'bg-muted/20'} ${index === 0 ? 'animate-fade-in' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {bid.username}
                        {bid.userId === "2" && " (You)"}
                      </span>
                      {bid.isWinning && (
                        <Badge variant="success" className="text-xs">
                          Leading
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${bid.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {bid.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Auction Stats */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Auction Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Bids</span>
                  <span className="font-medium">{bidHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Starting Price</span>
                  <span className="font-medium">${player.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price Increase</span>
                  <span className="font-medium text-success">
                    +${(currentBid - player.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Bid Increment</span>
                  <span className="font-medium">$37.5K</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;