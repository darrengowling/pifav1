import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Trophy, Users, DollarSign, Timer, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: 1,
      title: "Create or Join Tournament",
      description: "Start by creating a new tournament or joining an existing one with an invite code.",
      icon: Users,
      color: "text-primary"
    },
    {
      step: 2,
      title: "Set Your Budget",
      description: "Each participant gets a budget to bid on cricket players. Budget varies by tournament.",
      icon: DollarSign,
      color: "text-success"
    },
    {
      step: 3,
      title: "Live Auction",
      description: "Bid on cricket players in real-time. Highest bidder wins the player for their team.",
      icon: Timer,
      color: "text-warning"
    },
    {
      step: 4,
      title: "Build Your Squad",
      description: "Create a balanced team with batsmen, bowlers, all-rounders, and wicket-keepers.",
      icon: Target,
      color: "text-secondary"
    },
    {
      step: 5,
      title: "Compete & Win",
      description: "Your team's performance is based on real cricket matches. Top performers win!",
      icon: Trophy,
      color: "text-warning"
    }
  ];

  const features = [
    {
      title: "Real-time Bidding",
      description: "Experience live auction excitement with timer-based bidding system.",
      icon: "⚡"
    },
    {
      title: "Friends & Family",
      description: "Create private tournaments and invite friends to compete.",
      icon: "👥"
    },
    {
      title: "Strategic Gameplay",
      description: "Balance your budget and build the perfect cricket squad.",
      icon: "🎯"
    },
    {
      title: "Live Cricket Data",
      description: "Points based on real cricket performance and statistics.",
      icon: "📊"
    }
  ];

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How Sport X Cricket Works</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn how to create tournaments, bid on players, and build your dream cricket team
          </p>
        </div>

        {/* Step-by-step Guide */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">5 Simple Steps to Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <Card key={step.step} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <step.icon className={`h-6 w-6 ${step.color}`} />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tournament Types */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Tournament Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" />
                  Quick Test Tournament
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Perfect for beginners. 5 players, smaller budget, 30-minute auctions.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Players:</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <Badge variant="outline">$500K</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <Badge variant="outline">30 min</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Full Tournament
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Complete experience. Up to 12 players, full budget, 2-hour auctions.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Players:</span>
                    <Badge variant="outline">8-12</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <Badge variant="outline">$1M+</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <Badge variant="outline">2 hours</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Squad Composition */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Squad Composition</h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-primary">4</div>
                  <div className="text-sm text-muted-foreground">Batsmen</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-success">4</div>
                  <div className="text-sm text-muted-foreground">Bowlers</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-warning">2</div>
                  <div className="text-sm text-muted-foreground">All-Rounders</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold text-secondary">1</div>
                  <div className="text-sm text-muted-foreground">Wicket-Keeper</div>
                </div>
              </div>
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Build a balanced team with players from different positions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of cricket fans building their dream teams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/tournaments")}
              className="touch-target"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Browse Tournaments
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/tournaments?quick=test")}
              className="touch-target"
            >
              <Zap className="mr-2 h-5 w-5" />
              Quick Test Tournament
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;