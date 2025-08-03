import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Users, 
  Trophy, 
  Zap,
  TestTube,
  BookOpen,
  Bug,
  Lightbulb
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TestingGuide = () => {
  const navigate = useNavigate();

  const availableFeatures = [
    {
      name: "User Authentication",
      status: "working",
      description: "Quick authentication system for testing",
      howToTest: "Click 'Quick Auth' button on tournaments page",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Tournament Creation",
      status: "working", 
      description: "Create custom cricket tournaments with full configuration",
      howToTest: "Use 'Create Tournament' button after authentication, fill form, submit",
      icon: <Trophy className="h-5 w-5" />
    },
    {
      name: "Tournament Management",
      status: "working",
      description: "View, join tournaments, manage invite codes",
      howToTest: "Browse tournaments, copy invite codes, use 'Join with Code' feature",
      icon: <Play className="h-5 w-5" />
    },
    {
      name: "Real-time Features",
      status: "implemented",
      description: "WebSocket-based live updates and notifications",
      howToTest: "Create tournaments in multiple tabs, observe real-time updates",
      icon: <Zap className="h-5 w-5" />
    },
    {
      name: "Player Database", 
      status: "working",
      description: "Cricket player database with stats and positions",
      howToTest: "Navigate to auctions page to browse available players",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Live Auctions",
      status: "implemented",
      description: "Real-time bidding system with timer extensions",
      howToTest: "Start auction from tournament, place bids, test timer functionality",
      icon: <Play className="h-5 w-5" />
    }
  ];

  const scheduledImprovements = [
    {
      priority: "high",
      title: "Enhanced Authentication",
      description: "Full user registration, login, and profile management",
      timeline: "Next sprint"
    },
    {
      priority: "high", 
      title: "Tournament Analytics",
      description: "Detailed statistics, performance tracking, and leaderboards",
      timeline: "Next sprint"
    },
    {
      priority: "medium",
      title: "Mobile Responsiveness",
      description: "Optimized mobile experience and touch interactions",
      timeline: "2-3 weeks"
    },
    {
      priority: "medium",
      title: "Advanced Auction Features", 
      description: "Auto-bidding, bid history, advanced filters",
      timeline: "2-3 weeks"
    },
    {
      priority: "low",
      title: "Social Features",
      description: "Friend invitations, chat during auctions, social sharing",
      timeline: "Future release"
    },
    {
      priority: "low",
      title: "Tournament Templates",
      description: "Quick tournament creation with predefined settings",
      timeline: "Future release"
    }
  ];

  const knownLimitations = [
    "Authentication uses test accounts only (no permanent user accounts yet)",
    "Tournament deletion requires database access (no UI delete yet)",
    "Some UI components may not be fully mobile-optimized",
    "Real tournament scheduling (future dates) not fully implemented",
    "Advanced auction features (auto-bid, complex rules) pending"
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case "working": return "bg-green-500";
      case "implemented": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      case "planned": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "destructive";
      case "medium": return "secondary"; 
      case "low": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <TestTube className="h-8 w-8 text-primary" />
            SportX Testing Guide
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Comprehensive guide to testing the SportX Cricket Auction Platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/tournaments')} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Testing
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Start Testing (5 minutes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Navigate</h3>
                <p className="text-sm text-muted-foreground">Go to Tournaments page</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Authenticate</h3>
                <p className="text-sm text-muted-foreground">Click "Quick Auth" button</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Create</h3>
                <p className="text-sm text-muted-foreground">Create your first tournament</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Explore</h3>
                <p className="text-sm text-muted-foreground">Test invite codes & auctions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Available Features to Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFeatures.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{feature.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{feature.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(feature.status)}`} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <div className="bg-muted/50 p-2 rounded text-sm">
                        <strong>How to test:</strong> {feature.howToTest}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Testing Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Detailed Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Tournament Testing */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tournament Management Testing
              </h3>
              <div className="space-y-2 text-sm ml-7">
                <p><strong>1. Authentication:</strong> Click "Quick Auth" - this creates a temporary test user</p>
                <p><strong>2. Create Tournament:</strong> Fill out all form fields, customize squad composition</p>
                <p><strong>3. Invite System:</strong> Copy invite codes, test joining tournaments in new browser tab</p>
                <p><strong>4. Tournament Statistics:</strong> Verify participant counts and budget calculations update</p>
                <p><strong>5. Real-time Updates:</strong> Open multiple tabs, create tournaments, observe live updates</p>
              </div>
            </div>

            {/* Auction Testing */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Auction System Testing
              </h3>
              <div className="space-y-2 text-sm ml-7">
                <p><strong>1. Start Auction:</strong> Create tournament with 2+ participants, click "Start Auction"</p>
                <p><strong>2. Player Bidding:</strong> Browse players, place bids, test minimum increments</p>
                <p><strong>3. Timer System:</strong> Observe countdown timers, test bid extensions</p>
                <p><strong>4. Live Updates:</strong> Test bidding in multiple browser tabs simultaneously</p>
                <p><strong>5. Auction Completion:</strong> Complete player purchases, verify budget deductions</p>
              </div>
            </div>

            {/* UI/UX Testing */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Interface Testing
              </h3>
              <div className="space-y-2 text-sm ml-7">
                <p><strong>1. Navigation:</strong> Test all navigation links, page transitions</p>
                <p><strong>2. Forms:</strong> Validate form inputs, error handling, required fields</p>
                <p><strong>3. Responsive Design:</strong> Test on different screen sizes (desktop, tablet)</p>
                <p><strong>4. Interactive Elements:</strong> Buttons, modals, tooltips, copy functions</p>
                <p><strong>5. Data Display:</strong> Statistics, tables, card layouts, search functionality</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Improvements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Scheduled Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledImprovements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{improvement.title}</h3>
                      <Badge variant={getPriorityColor(improvement.priority)}>
                        {improvement.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{improvement.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Timeline: {improvement.timeline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Known Limitations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Known Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {knownLimitations.map((limitation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{limitation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              Feedback & Bug Reporting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your feedback is valuable! When testing, please note:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-green-600">What's Working Well</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Features that work smoothly</li>
                    <li>• UI elements you like</li>
                    <li>• Performance observations</li>
                    <li>• Intuitive workflows</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-red-600">Issues Found</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Steps to reproduce bugs</li>
                    <li>• UI/UX inconsistencies</li>
                    <li>• Performance issues</li>
                    <li>• Confusing interactions</li>
                  </ul>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Test Environment:</strong> This is a development version with test data. 
                  All tournaments and user accounts are temporary and will be reset periodically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestingGuide;