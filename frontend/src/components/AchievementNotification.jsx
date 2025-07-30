import React, { useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, X } from 'lucide-react';

const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="w-80 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 shadow-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div>
              <div className="text-sm font-semibold text-primary">Achievement Unlocked!</div>
              <div className="font-bold">{achievement.title}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {achievement.description}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            +{achievement.points} pts
          </Badge>
          <Badge variant="outline">
            {achievement.category}
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default AchievementNotification;