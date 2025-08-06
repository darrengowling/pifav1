import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { sports } from "../data/sports";
import RealTimeStats from "../components/RealTimeStats";
import { TrendingUp, Trophy, Users, Zap, TestTube } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  
  const handleSportSelect = (sport) => {
    navigate(`/tournaments`);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-quick':
        navigate("/tournaments?quick=test");
        break;
      case 'share-code':
        alert("Tip: Use the share button next to invite codes!");
        break;
      case 'bid-tips':
        alert("Quick Tip: Use Quick Bid buttons for fast bidding!");
        break;
      case 'strategy-guide':
        navigate("/how-it-works");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      {/* Hero Section with Cricket Action Background */}
      <section className="relative overflow-hidden min-h-screen flex items-center md:min-h-0" style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.7)), url("https://customer-assets.emergentagent.com/job_cricket-bidding/artifacts/sjmiu7t3_pic%2011.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container mx-auto px-4 py-8 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              <span className="drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                Sport X Cricket
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4">
              Play with friends. Bid for superstars. Build legendary teams.
            </p>
            <div className="inline-block bg-primary/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full live-indicator"></div>
                🔴 Live Real-time Auctions • WebSocket Powered
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg" 
                className="btn-cricket-primary touch-target"
                onClick={() => {
                  alert("Creating test tournament! 🏏");
                  navigate("/tournaments?quick=test");
                }}
              >
                <Zap className="mr-2 h-5 w-5" />
                Quick Test Tournament
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-cricket-secondary touch-target"
                onClick={() => {
                  navigate("/tournaments");
                }}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Browse All Tournaments
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Stats Section */}
      <section className="py-8 border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Live Platform Stats
            </h2>
            <p className="text-muted-foreground">Real-time data powered by WebSocket connections</p>
          </div>
          <RealTimeStats />
        </div>
      </section>

      {/* Features Section - Cricket Equipment Background */}
      <section className="py-16 relative" style={{
        backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.6)), url("https://customer-assets.emergentagent.com/job_cricket-bidding/artifacts/9g71puh1_pic%2013.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Play. Connect. Compete.</h2>
            <p className="text-lg text-white/80">
              Connect with friends, compete in live auctions, and celebrate cricket together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto md:grid-cols-3 md:gap-8 md:max-w-4xl">
            <div className="cricket-card text-center p-8 rounded-lg">
              <div className="text-secondary text-3xl mb-4">⚡</div>
              <h3 className="font-semibold mb-2 text-lg text-white">Real-time Bidding</h3>
              <p className="text-white/70">WebSocket-powered live auctions with instant updates</p>
            </div>
            <div className="cricket-card text-center p-8 rounded-lg">
              <div className="text-primary text-3xl mb-4">🏆</div>
              <h3 className="font-semibold mb-2 text-lg text-white">Achievement System</h3>
              <p className="text-white/70">Unlock achievements and earn points for your cricket expertise</p>
            </div>
            <div className="cricket-card text-center p-8 rounded-lg">
              <div className="text-secondary text-3xl mb-4">👥</div>
              <h3 className="font-semibold mb-2 text-lg text-white">Social Features</h3>
              <p className="text-white/70">Invite friends, chat during auctions, and build communities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Features</h2>
            <p className="text-lg text-muted-foreground">
              Built with cutting-edge technology for the ultimate auction experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">WebSocket Technology</h3>
              <p className="text-sm text-muted-foreground">Real-time bidding updates across all devices</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Smart Timers</h3>
              <p className="text-sm text-muted-foreground">Auto-extending timers with final countdown alerts</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Live Presence</h3>
              <p className="text-sm text-muted-foreground">See who's online and participating in auctions</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Live Analytics</h3>
              <p className="text-sm text-muted-foreground">Real-time statistics and performance tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cricket Action Showcase */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience Cricket Like Never Before</h2>
            <p className="text-lg text-muted-foreground">
              From dramatic wickets to powerful sixes - live every moment of cricket action
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cricket Action Image 1 */}
            <div className="relative group">
              <img 
                src="https://customer-assets.emergentagent.com/job_cricket-bidding/artifacts/ddsuh3gd_pic%2012.jpg"
                alt="Cricket Action - Overhead Stadium View"
                className="cricket-image w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Stadium Atmosphere</h3>
                  <p className="text-white/80">Experience the electric energy of cricket stadiums</p>
                </div>
              </div>
            </div>

            {/* Cricket Action Image 2 */}
            <div className="relative group">
              <img 
                src="https://customer-assets.emergentagent.com/job_cricket-bidding/artifacts/resnsflv_pic%2014.webp"
                alt="Cricket Action - Dynamic Batting"
                className="cricket-image w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Power & Precision</h3>
                  <p className="text-white/80">Bid on players with explosive batting skills</p>
                </div>
              </div>
            </div>

            {/* Cricket Action Image 3 */}
            <div className="relative group">
              <img 
                src="https://customer-assets.emergentagent.com/job_cricket-bidding/artifacts/qnqk3mei_pic%2015.jpg"
                alt="Cricket Action - Wicket Drama"
                className="cricket-image w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Wicket Drama</h3>
                  <p className="text-white/80">Every ball counts in the ultimate cricket experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 gradient-cricket relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Build Your Squad?</h2>
            <p className="text-lg text-white/80 mb-8">
              Join the most advanced cricket auction platform with real-time features and social gameplay.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="hero" 
                size="lg"
                className="btn-cricket-primary touch-target"
                onClick={() => {
                  alert("Go to Tournaments! 🏏");
                  navigate("/tournaments");
                }}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="btn-cricket-secondary touch-target"
                onClick={() => navigate("/testing")}
              >
                <TestTube className="mr-2 h-5 w-5" />
                Testing Guide
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;