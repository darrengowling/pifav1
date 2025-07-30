import React from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, Search, Trophy } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center pb-20 md:pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl font-bold text-primary mb-4">404</div>
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/")}
              className="w-full touch-target"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/tournaments")}
                className="flex-1 touch-target"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Tournaments
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/auctions")}
                className="flex-1 touch-target"
              >
                <Search className="mr-2 h-5 w-5" />
                Auctions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;