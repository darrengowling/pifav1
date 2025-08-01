import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Plus, Minus, Trophy, Users, DollarSign, Calendar, Clock } from "lucide-react";
import { cn } from "../lib/utils";

const TournamentCreateModal = ({ isOpen, onClose, onCreateTournament }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    realLifeTournament: "",
    maxParticipants: 8,
    budget: 500000,
    squadComposition: {
      batsmen: 4,
      bowlers: 4,
      allRounders: 2,
      wicketKeepers: 1
    },
    auctionDuration: 2.0
  });

  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSquadChange = (position, change) => {
    const newComposition = {
      ...formData.squadComposition,
      [position]: Math.max(1, formData.squadComposition[position] + change)
    };
    
    setFormData(prev => ({
      ...prev,
      squadComposition: newComposition
    }));
  };

  const getTotalSquadSize = () => {
    const { batsmen, bowlers, allRounders, wicketKeepers } = formData.squadComposition;
    return batsmen + bowlers + allRounders + wicketKeepers;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tournament name is required";
    }

    if (!formData.realLifeTournament.trim()) {
      newErrors.realLifeTournament = "Real-life tournament reference is required";
    }

    if (formData.maxParticipants < 2 || formData.maxParticipants > 20) {
      newErrors.maxParticipants = "Participants must be between 2 and 20";
    }

    if (formData.budget < 100000 || formData.budget > 5000000) {
      newErrors.budget = "Budget must be between $100K and $5M";
    }

    const totalSquad = getTotalSquadSize();
    if (totalSquad < 8 || totalSquad > 15) {
      newErrors.squad = "Total squad size must be between 8 and 15 players";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      await onCreateTournament({
        ...formData,
        real_life_tournament: formData.realLifeTournament,
        max_participants: formData.maxParticipants,
        squad_composition: formData.squadComposition,
        auction_duration: formData.auctionDuration
      });
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        realLifeTournament: "",
        maxParticipants: 8,
        budget: 500000,
        squadComposition: {
          batsmen: 4,
          bowlers: 4,
          allRounders: 2,
          wicketKeepers: 1
        },
        auctionDuration: 2.0
      });
    } catch (error) {
      console.error("Error creating tournament:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Create Cricket Tournament
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your cricket auction tournament
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Tournament Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tournament Details</h3>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tournament Name *
                </label>
                <Input
                  placeholder="e.g., Friends Cricket Championship"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description (Optional)
                </label>
                <Input
                  placeholder="Brief description of your tournament"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Based on Real Tournament *
                </label>
                <Input
                  placeholder="e.g., IPL 2024, World Cup 2023"
                  value={formData.realLifeTournament}
                  onChange={(e) => handleInputChange("realLifeTournament", e.target.value)}
                  className={cn(errors.realLifeTournament && "border-destructive")}
                />
                {errors.realLifeTournament && (
                  <p className="text-sm text-destructive mt-1">{errors.realLifeTournament}</p>
                )}
              </div>
            </div>

            {/* Tournament Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tournament Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="20"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value))}
                    className={cn(errors.maxParticipants && "border-destructive")}
                  />
                  {errors.maxParticipants && (
                    <p className="text-sm text-destructive mt-1">{errors.maxParticipants}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget per Player
                  </label>
                  <Input
                    type="number"
                    min="100000"
                    max="5000000"
                    step="50000"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", parseInt(e.target.value))}
                    className={cn(errors.budget && "border-destructive")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${formData.budget.toLocaleString()}
                  </p>
                  {errors.budget && (
                    <p className="text-sm text-destructive mt-1">{errors.budget}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Auction Duration (Hours)
                </label>
                <select
                  value={formData.auctionDuration}
                  onChange={(e) => handleInputChange("auctionDuration", parseFloat(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="0.5">30 minutes (Quick)</option>
                  <option value="1.0">1 hour</option>
                  <option value="1.5">1.5 hours</option>
                  <option value="2.0">2 hours (Recommended)</option>
                  <option value="3.0">3 hours</option>
                </select>
              </div>
            </div>

            {/* Squad Composition */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Squad Composition</h3>
              <p className="text-sm text-muted-foreground">
                Set how many players of each type teams must have
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "batsmen", label: "Batsmen", icon: "🏏" },
                  { key: "bowlers", label: "Bowlers", icon: "⚡" },
                  { key: "allRounders", label: "All-Rounders", icon: "🎯" },
                  { key: "wicketKeepers", label: "Wicket-Keepers", icon: "🥅" }
                ].map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span>{icon}</span>
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSquadChange(key, -1)}
                        disabled={formData.squadComposition[key] <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-lg min-w-[2rem] text-center">
                        {formData.squadComposition[key]}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSquadChange(key, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <span className="font-semibold">Total Squad Size: </span>
                <Badge variant={getTotalSquadSize() >= 8 && getTotalSquadSize() <= 15 ? "default" : "destructive"}>
                  {getTotalSquadSize()} players
                </Badge>
              </div>
              
              {errors.squad && (
                <p className="text-sm text-destructive">{errors.squad}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Create Tournament
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default TournamentCreateModal;