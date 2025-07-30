import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Trophy, Timer, Target } from 'lucide-react';
import { playersApi } from '../lib/api';

const RealTimeStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    activeAuctions: 0,
    totalTournaments: 0,
    websocketConnections: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stats/live`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching live stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Update stats every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: Users,
      label: 'Online Users',
      value: stats.onlineUsers,
      total: stats.totalUsers,
      color: 'text-success',
      showRatio: true
    },
    {
      icon: Trophy,
      label: 'Live Auctions',
      value: stats.activeAuctions,
      color: 'text-warning',
      pulse: stats.activeAuctions > 0
    },
    {
      icon: Target,
      label: 'Tournaments',
      value: stats.totalTournaments,
      color: 'text-primary'
    },
    {
      icon: Timer,
      label: 'Real-time Connections',
      value: stats.websocketConnections,
      color: 'text-secondary'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-6 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="p-4 text-center gradient-auction">
          <div className={`flex items-center justify-center mb-2 ${item.pulse ? 'animate-pulse-glow' : ''}`}>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <div className={`text-2xl font-bold ${item.color} mb-1`}>
            {item.showRatio ? `${item.value}/${item.total}` : item.value}
            {item.pulse && <Badge variant="destructive" className="ml-2 text-xs animate-pulse">LIVE</Badge>}
          </div>
          <div className="text-sm text-muted-foreground">{item.label}</div>
        </Card>
      ))}
    </div>
  );
};

export default RealTimeStats;