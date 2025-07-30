import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { cricketPlayers } from "../data/cricketPlayers";
import { Search, Filter, SortDesc, Trophy, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auctions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const handlePlayerBid = (player) => {
    navigate(`/auction/${player.id}`);
  };

  // Use expanded cricket player data
  const auctions = cricketPlayers;

  const filteredAuctions = auctions.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Cricket Auctions
            </h1>
            <p className="text-muted-foreground">
              Bid on cricket stars and build your dream team
            </p>
          </div>
          <Button 
            variant="auction" 
            size="lg" 
            className="mt-4 md:mt-0 touch-target"
            onClick={() => alert("Create auction feature coming soon! 🎯")}
          >
            <Trophy className="mr-2 h-5 w-5" />
            Create Auction
          </Button>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center gradient-auction">
            <div className="text-2xl font-bold text-success">24</div>
            <div className="text-sm text-muted-foreground">Live Now</div>
          </Card>
          <Card className="p-4 text-center gradient-auction">
            <div className="text-2xl font-bold text-warning">156</div>
            <div className="text-sm text-muted-foreground">Ending Soon</div>
          </Card>
          <Card className="p-4 text-center gradient-auction">
            <div className="text-2xl font-bold text-primary">2.1K</div>
            <div className="text-sm text-muted-foreground">Active Bidders</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cricket players, positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="touch-target"
              onClick={() => alert("Advanced filters coming soon! 🔧")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="touch-target"
              onClick={() => alert("Sort options coming soon! 📊")}
            >
              <SortDesc className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
        </div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map((player, index) => (
            <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePlayerBid(player)}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Rating</div>
                    <div className="text-lg font-bold">{player.rating}/100</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1">{player.name}</h3>
                  <Badge variant="outline" className="mb-2">
                    {player.position}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Base Price:</span>
                    <span className="font-medium">${player.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Bid:</span>
                    <span className="font-bold text-success">${(player.price + Math.floor(Math.random() * 200000)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Left:</span>
                    <span className="font-medium text-warning">{Math.floor(Math.random() * 5) + 1}h {Math.floor(Math.random() * 60)}m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{Math.floor(Math.random() * 25) + 8} bidders</span>
                  </div>
                  {index < 4 && (
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  variant={index < 4 ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayerBid(player);
                  }}
                >
                  {index < 4 ? "Join Live Auction" : "Place Bid"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <div className="text-xl font-bold mb-2">No auctions found</div>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria or check back later for new auctions.</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
              className="touch-target"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;