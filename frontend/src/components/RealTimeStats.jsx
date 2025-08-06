import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Trophy, Timer, Target } from 'lucide-react';
import { useLiveStats } from '../hooks/useApi';
import { StatsCardSkeleton } from './LoadingSpinner';

const RealTimeStats = () => {
  const { data: stats, isLoading, error } = useLiveStats();

  const statItems = [
    {
      icon: Users,
      label: 'Online Users',
      value: stats?.onlineUsers || 0,
      total: stats?.totalUsers || 0,
      color: 'text-success',
      showRatio: true
    },
    {
      icon: Trophy,
      label: 'Live Auctions',
      value: stats?.activeAuctions || 0,
      color: 'text-warning',
      pulse: (stats?.activeAuctions || 0) > 0
    },
    {
      icon: Target,
      label: 'Tournaments',
      value: stats?.totalTournaments || 0,
      color: 'text-primary'
    },
    {
      icon: Timer,
      label: 'WebSocket Connections',
      value: stats?.websocketConnections || 0,
      color: 'text-secondary',
      pulse: (stats?.websocketConnections || 0) > 0
    }
  ];

  if (error) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 text-center">
            <div className="text-muted-foreground">
              <div className="text-2xl font-bold">--</div>
              <div className="text-sm">Offline</div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="p-4 text-center gradient-auction transition-all hover:scale-105">
          <div className={`flex items-center justify-center mb-2 ${item.pulse ? 'animate-pulse-glow' : ''}`}>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <div className={`text-2xl font-bold ${item.color} mb-1 flex items-center justify-center gap-2`}>
            {item.showRatio ? `${item.value}/${item.total}` : item.value}
            {item.pulse && item.value > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{item.label}</div>
          
          {/* Connection quality indicator */}
          {item.label === 'WebSocket Connections' && (
            <div className="mt-2">
              <div className={`text-xs font-medium ${item.value > 0 ? 'text-success' : 'text-gray-600'}`}>
                {item.value > 0 ? '🟢 Connected' : '🔴 Offline'}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default RealTimeStats;