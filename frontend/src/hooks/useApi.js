import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playersApi, tournamentsApi, auctionsApi } from '../lib/api';
import toast from 'react-hot-toast';

// Custom hook for API calls with error handling and loading states
export const useApiCall = (apiCall, queryKey, options = {}) => {
  return useQuery({
    queryKey,
    queryFn: apiCall,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      const message = error.response?.data?.detail || 'Something went wrong';
      toast.error(message);
    },
    ...options
  });
};

// Players hooks
export const usePlayers = (filters = {}) => {
  const { position, search } = filters;
  
  return useQuery({
    queryKey: ['players', { position, search }],
    queryFn: () => playersApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes - players don't change often
    select: (data) => {
      let filtered = data;
      
      if (position) {
        filtered = filtered.filter(player => player.position === position);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(player =>
          player.name.toLowerCase().includes(searchLower) ||
          player.position.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    }
  });
};

export const usePlayer = (playerId) => {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: () => playersApi.getById(playerId),
    enabled: !!playerId,
    staleTime: 10 * 60 * 1000,
  });
};

// Tournaments hooks
export const useTournaments = (filters = {}) => {
  const { status, search } = filters;
  
  return useQuery({
    queryKey: ['tournaments', { status, search }],
    queryFn: () => tournamentsApi.getAll(),
    select: (data) => {
      let filtered = data;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(tournament => tournament.status === status);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(tournament =>
          tournament.name.toLowerCase().includes(searchLower) ||
          tournament.real_life_tournament.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    }
  });
};

export const useTournament = (tournamentId) => {
  return useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentsApi.getById(tournamentId),
    enabled: !!tournamentId,
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tournamentsApi.create,
    onSuccess: (newTournament) => {
      queryClient.invalidateQueries(['tournaments']);
      toast.success('Tournament created successfully! 🏆');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to create tournament';
      toast.error(message);
    }
  });
};

export const useJoinTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tournamentId, inviteCode }) => 
      tournamentsApi.join(tournamentId, inviteCode),
    onSuccess: (tournament) => {
      queryClient.invalidateQueries(['tournaments']);
      queryClient.invalidateQueries(['tournament', tournament.id]);
      toast.success(`Joined ${tournament.name} successfully! 🎉`);
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to join tournament';
      toast.error(message);
    }
  });
};

// Auctions hooks
export const useAuctions = (filters = {}) => {
  return useQuery({
    queryKey: ['auctions', filters],
    queryFn: () => auctionsApi.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes - auctions change frequently
  });
};

export const useAuction = (auctionId) => {
  return useQuery({
    queryKey: ['auction', auctionId],
    queryFn: () => auctionsApi.getById(auctionId),
    enabled: !!auctionId,
    refetchInterval: 5000, // Refetch every 5 seconds for live data
  });
};

export const useAuctionBids = (auctionId) => {
  return useQuery({
    queryKey: ['auction-bids', auctionId],
    queryFn: () => auctionsApi.getBids(auctionId),
    enabled: !!auctionId,
    refetchInterval: 3000, // Refetch every 3 seconds for live bids
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ auctionId, amount }) => 
      auctionsApi.placeBid(auctionId, { amount }),
    onSuccess: (bid, { auctionId }) => {
      queryClient.invalidateQueries(['auction', auctionId]);
      queryClient.invalidateQueries(['auction-bids', auctionId]);
      toast.success(`Bid placed: $${bid.amount.toLocaleString()}! 🎯`);
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to place bid';
      toast.error(message);
    }
  });
};

// Live stats hook
export const useLiveStats = () => {
  return useQuery({
    queryKey: ['live-stats'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stats/live`);
      if (!response.ok) {
        throw new Error('Failed to fetch live stats');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Data is fresh for 5 seconds
  });
};

// Debounced search hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};