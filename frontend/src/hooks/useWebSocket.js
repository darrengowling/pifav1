import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const useWebSocket = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [auctionStatus, setAuctionStatus] = useState('active');
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    if (!userId) return;

    try {
      // Use the backend URL from environment
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const wsUrl = backendUrl.replace('http', 'ws') + `/ws/${userId}`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
        
        // Send ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Reconnect after 3 seconds if not intentionally closed
        if (event.code !== 1000) {
          reconnectTimeout.current = setTimeout(connect, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [userId]);

  const handleWebSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'bid_update':
        setBidHistory(prev => [message.bid, ...prev.slice(0, 9)]);
        toast.success(`${message.bid.username} bid $${message.bid.amount.toLocaleString()}! 🎯`);
        break;

      case 'user_joined':
        setParticipants(prev => [...prev.filter(p => p.id !== message.user_id), {
          id: message.user_id,
          username: message.username,
          isOnline: true,
          joinedAt: new Date(message.timestamp)
        }]);
        toast(`${message.username} joined the auction! 👋`, { icon: '🏏' });
        break;

      case 'user_left':
        setParticipants(prev => prev.filter(p => p.id !== message.user_id));
        break;

      case 'timer_update':
        setTimeRemaining(message.time_remaining);
        break;

      case 'timer_warning':
        toast.error(message.message, { icon: '⚠️' });
        break;

      case 'timer_final_warning':
        toast.error(message.message, { icon: '🚨', duration: 2000 });
        break;

      case 'timer_extended':
        toast.success(`Timer extended by ${message.additional_seconds} seconds!`, { icon: '⏰' });
        break;

      case 'auction_status':
        if (message.status === 'ended') {
          setAuctionStatus('ended');
          const winner = message.data?.winner;
          if (winner) {
            toast.success(
              `Auction ended! ${winner.username} won with $${winner.winning_bid.toLocaleString()}! 🏆`,
              { duration: 5000 }
            );
          }
        }
        break;

      case 'notification':
        const notification = message.notification;
        switch (notification.type) {
          case 'success':
            toast.success(notification.message);
            break;
          case 'error':
            toast.error(notification.message);
            break;
          case 'warning':
            toast(notification.message, { icon: '⚠️' });
            break;
          default:
            toast(notification.message);
        }
        break;

      case 'pong':
        // Handle ping response
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Intentional disconnect');
    }
  }, []);

  const joinAuction = useCallback((auctionId, username) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'join_auction',
        auction_id: auctionId,
        username: username
      }));
    }
  }, []);

  const leaveAuction = useCallback((username) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'leave_auction',
        username: username
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    participants,
    bidHistory,
    timeRemaining,
    auctionStatus,
    joinAuction,
    leaveAuction,
    disconnect
  };
};

export default useWebSocket;