import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import TournamentCreateModal from "../components/TournamentCreateModal";
import { Calendar, Users, Trophy, Clock, Copy, Play, Search, Plus, Zap, Share2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { tournamentsApi, authApi } from "../lib/api";

const Tournaments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // Quick authentication for testing
  const quickAuth = async () => {
    try {
      // Create a test user
      const timestamp = Date.now();
      const testUser = {
        username: `test_user_${timestamp}`,
        email: `test_${timestamp}@sportx.com`,
        password: "TestPass123!"
      };

      try {
        // Try to register
        await authApi.register(testUser);
      } catch (registerError) {
        // If registration fails (user exists), ignore and try login
        console.log("Registration failed, trying login:", registerError.response?.data);
      }

      // Try to login
      const loginResponse = await authApi.login({
        email: testUser.email,
        password: testUser.password
      });

      const token = loginResponse.data.access_token;
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      alert("✅ Authenticated successfully! You can now create tournaments.");
      
      // Refresh tournaments after authentication
      fetchTournaments();
    } catch (error) {
      console.error('Authentication error:', error);
      alert(`Authentication failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Fetch tournaments from backend
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await tournamentsApi.getAll();
      setTournaments(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setError('Failed to load tournaments');
      // Keep using mock data if API fails
      setTournaments([
        {
          id: "1",
          name: "IPL 2024 Championship",
          sport: "cricket",
          real_life_tournament: "IPL 2024",
          admin: "Current User",
          participants: [
            { id: "1", name: "You", budget: 100000, squad: [], user_id: "1", is_admin: false, invite_status: "accepted", current_budget: 100000, total_score: 0 },
            { id: "2", name: "Alex Kumar", budget: 100000, squad: [], user_id: "2", is_admin: false, invite_status: "accepted", current_budget: 100000, total_score: 0 }
          ],
          max_participants: 10,
          status: "setup",
          budget: 100000,
          squad_composition: {
            batsmen: 4,
            bowlers: 4,
            all_rounders: 2,
            wicket_keepers: 1
          },
          auction_date: new Date("2024-03-15T18:00:00"),
          auction_duration: 2,
          created_at: new Date("2024-03-01"),
          invite_code: "ABC123"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load tournaments on component mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreateTournament = async (tournamentData) => {
    try {
      if (!isAuthenticated) {
        alert("Please authenticate first to create tournaments.");
        return;
      }

      const response = await tournamentsApi.create({
        name: tournamentData.name,
        description: tournamentData.description,
        real_life_tournament: tournamentData.realLifeTournament,
        max_participants: tournamentData.maxParticipants,
        budget: tournamentData.budget,
        squad_composition: {
          batsmen: tournamentData.squadComposition.batsmen,
          bowlers: tournamentData.squadComposition.bowlers,
          all_rounders: tournamentData.squadComposition.allRounders,
          wicket_keepers: tournamentData.squadComposition.wicketKeepers
        },
        auction_duration: tournamentData.auctionDuration
      });

      const newTournament = response.data;
      
      // Update local state with new tournament
      setTournaments(prev => [newTournament, ...prev]);
      
      // Show success message
      alert(`🏏 Tournament "${newTournament.name}" created successfully! Invite Code: ${newTournament.invite_code || 'N/A'}`);
      
      return newTournament;
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert(`Failed to create tournament: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  };

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleJoinTournament = (tournamentId) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    if (tournament.participants.length >= tournament.maxParticipants) {
      alert("Tournament is full!");
      return;
    }

    setTournaments(prev => prev.map(t => 
      t.id === tournamentId 
        ? { ...t, participants: [...t.participants, { 
            id: "current-user", 
            name: "You", 
            budget: t.budget, 
            squad: [],
            userId: "current-user",
            isAdmin: false,
            inviteStatus: "accepted",
            currentBudget: t.budget,
            totalScore: 0
          }] }
        : t
    ));
    
    alert("Joined tournament successfully!");
  };

  const handleStartAuction = async (tournamentId) => {
    try {
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        alert("Tournament not found");
        return;
      }

      if ((tournament.participants?.length || 0) < 2) {
        alert("Need at least 2 players to start auction");
        return;
      }

      // For demo purposes, let's get a random player to auction
      const response = await fetch(`${BACKEND_URL}/api/players`);
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const players = await response.json();
      if (!players || players.length === 0) {
        alert("No players available for auction");
        return;
      }

      // Select a random player for the auction
      const randomPlayer = players[Math.floor(Math.random() * players.length)];

      // Create auction via API
      const auctionResponse = await fetch(`${BACKEND_URL}/api/auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          tournament_id: tournamentId,
          player_id: randomPlayer.id,
          duration_minutes: 180
        })
      });

      if (!auctionResponse.ok) {
        const errorText = await auctionResponse.text();
        throw new Error(`Failed to create auction: ${errorText}`);
      }

      const auction = await auctionResponse.json();
      
      // Navigate to the auction room
      navigate(`/auction/${auction.id}`);
      
    } catch (error) {
      console.error('Error starting auction:', error);
      alert(`Failed to start auction: ${error.message}`);
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Invite code copied!");
  };

  const joinWithInviteCode = () => {
    if (!inviteCode.trim()) {
      alert("Please enter an invite code");
      return;
    }

    const tournament = tournaments.find(t => t.inviteCode === inviteCode.trim());
    if (!tournament) {
      alert("Invalid invite code");
      return;
    }

    handleJoinTournament(tournament.id);
    setInviteCode("");
  };

  const tabs = [
    { 
      value: "all", 
      label: "All", 
      count: tournaments.length 
    },
    { 
      value: "setup", 
      label: "Setup", 
      count: tournaments.filter(t => t.status === "setup").length 
    },
    { 
      value: "active", 
      label: "Active", 
      count: tournaments.filter(t => t.status === "active").length 
    },
    { 
      value: "auction_scheduled", 
      label: "Auction Soon", 
      count: tournaments.filter(t => t.status === "auction_scheduled").length 
    },
  ];

  // Filter tournaments based on search and selected tab
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.realLifeTournament.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === "all" || tournament.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cricket Tournaments</h1>
            <p className="text-muted-foreground">Create and join strategic cricket tournaments</p>
            {error && (
              <p className="text-sm text-red-500 mt-1">
                ⚠️ {error} - Using offline mode
              </p>
            )}
            {!isAuthenticated && (
              <p className="text-sm text-orange-600 mt-1">
                🔐 Click "Quick Auth" to enable tournament creation
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            {!isAuthenticated && (
              <Button 
                variant="secondary"
                onClick={quickAuth}
                className="flex-1 md:flex-none"
              >
                🔐 Quick Auth
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => alert("Quick tournament creation coming soon!")}
              className="flex-1 md:flex-none"
              disabled={loading}
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Test (5 Players)
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                if (!isAuthenticated) {
                  alert("Please authenticate first by clicking 'Quick Auth' button.");
                  return;
                }
                setShowCreateModal(true);
              }}
              className="flex-1 md:flex-none"
              disabled={loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Button>
          </div>
        </div>

        {/* Tournament Creation Modal */}
        <TournamentCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateTournament={handleCreateTournament}
        />

        {/* Join with Invite Code */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter invite code to join tournament..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinWithInviteCode()}
              />
            </div>
            <Button onClick={joinWithInviteCode}>
              <Plus className="mr-2 h-4 w-4" />
              Join with Code
            </Button>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {tournaments.filter(t => t.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Tournaments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">
                {tournaments.filter(t => t.status === "auction_scheduled").length}
              </div>
              <div className="text-sm text-muted-foreground">Auctions Soon</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-secondary">
                {tournaments.reduce((acc, t) => acc + t.participants.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Participants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {tournaments.reduce((acc, t) => acc + (t.budget * t.participants.length), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="relative">
                {tab.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            <span>Loading tournaments...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.length > 0 ? (
              filteredTournaments.map((tournament) => {
                // Normalize tournament data to handle backend vs mock data differences
                const normalizedTournament = {
                  ...tournament,
                  realLifeTournament: tournament.real_life_tournament || tournament.realLifeTournament,
                  maxParticipants: tournament.max_participants || tournament.maxParticipants,
                  squadComposition: tournament.squad_composition || tournament.squadComposition,
                  inviteCode: tournament.invite_code || tournament.inviteCode,
                  admin: tournament.admin || (tournament.participants?.find(p => p.is_admin || p.isAdmin)?.username) || "Unknown",
                  // Normalize participant data
                  participants: (tournament.participants || []).map(p => ({
                    ...p,
                    name: p.username || p.name,
                    userId: p.user_id || p.userId,
                    isAdmin: p.is_admin || p.isAdmin,
                    inviteStatus: p.invite_status || p.inviteStatus,
                    currentBudget: p.current_budget || p.currentBudget,
                    totalScore: p.total_score || p.totalScore
                  }))
                };
                
                return (
                  <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{normalizedTournament.name}</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            Based on {normalizedTournament.realLifeTournament}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              normalizedTournament.status === 'active' ? 'default' : 
                              normalizedTournament.status === 'auction_scheduled' ? 'secondary' : 
                              'outline'
                            }>
                              {normalizedTournament.status === 'setup' ? 'Setup' :
                               normalizedTournament.status === 'auction_scheduled' ? 'Auction Scheduled' :
                               normalizedTournament.status === 'active' ? 'Live' : 'Completed'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by {normalizedTournament.admin}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {normalizedTournament.participants?.length || 0}/{normalizedTournament.maxParticipants} players
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Budget:</span>
                          <span className="font-medium">{normalizedTournament.budget?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Squad Size:</span>
                          <span className="font-medium">
                            {normalizedTournament.squadComposition ? 
                              (normalizedTournament.squadComposition.batsmen + normalizedTournament.squadComposition.bowlers + 
                               (normalizedTournament.squadComposition.allRounders || normalizedTournament.squadComposition.all_rounders || 0) + 
                               (normalizedTournament.squadComposition.wicketKeepers || normalizedTournament.squadComposition.wicket_keepers || 0)) : 11
                            } players
                          </span>
                        </div>
                        {normalizedTournament.inviteCode && (
                          <div className="flex justify-between items-center">
                            <span>Invite Code:</span>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-auto p-1 font-mono text-primary font-bold"
                                onClick={() => copyInviteCode(normalizedTournament.inviteCode)}
                              >
                                {normalizedTournament.inviteCode}
                                <Copy className="ml-1 h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  try {
                                    const shareText = `Join my cricket tournament "${normalizedTournament.name}"! Use invite code: ${normalizedTournament.inviteCode}`;
                                    
                                    if (navigator.clipboard && navigator.clipboard.writeText) {
                                      await navigator.clipboard.writeText(shareText);
                                      alert("Invite message copied to clipboard! Share it with friends.");
                                    } else {
                                      const textArea = document.createElement('textarea');
                                      textArea.value = shareText;
                                      document.body.appendChild(textArea);
                                      textArea.focus();
                                      textArea.select();
                                      document.execCommand('copy');
                                      document.body.removeChild(textArea);
                                      alert("Invite message copied! Share it with friends.");
                                    }
                                  } catch (error) {
                                    console.error("Share error:", error);
                                    alert(`Share failed: ${error.message || 'Unknown error'}`);
                                  }
                                }}
                                title="Invite Players - Click to copy invite message"
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status-specific actions */}
                      {normalizedTournament.status === 'setup' && (normalizedTournament.participants?.length || 0) < 2 && normalizedTournament.admin === "Current User" && (
                        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg mb-3">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <span className="text-sm text-warning">Need at least 2 players to start auction</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {normalizedTournament.admin === "Current User" ? (
                          <Button 
                            className="flex-1" 
                            onClick={() => handleStartAuction(normalizedTournament.id)}
                            disabled={(normalizedTournament.participants?.length || 0) < 2}
                            variant={(normalizedTournament.participants?.length || 0) >= 2 ? "default" : "outline"}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {normalizedTournament.status === 'setup' ? 'Start Auction' : 'Enter Auction'}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleJoinTournament(normalizedTournament.id)}
                            disabled={(normalizedTournament.participants?.length || 0) >= normalizedTournament.maxParticipants}
                          >
                            {normalizedTournament.participants?.some(p => p.name === "You") ? "✓ Joined" : "Join Tournament"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground mb-4">No tournaments found</div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTab("all");
                  }}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;