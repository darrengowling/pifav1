import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast, { Toaster } from 'react-hot-toast';
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import Auctions from "./pages/Auctions";
import AuctionRoom from "./pages/AuctionRoom";
import HowItWorks from "./pages/HowItWorks";
import TestingGuide from "./pages/TestingGuide";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Navigation />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tournaments" element={
                  <ErrorBoundary>
                    <Tournaments />
                  </ErrorBoundary>
                } />
                <Route path="/auctions" element={
                  <ErrorBoundary>
                    <Auctions />
                  </ErrorBoundary>
                } />
                <Route path="/auction/:playerId" element={
                  <ErrorBoundary>
                    <AuctionRoom />
                  </ErrorBoundary>
                } />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
                success: {
                  iconTheme: {
                    primary: 'hsl(var(--success))',
                    secondary: 'hsl(var(--success-foreground))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(var(--destructive))',
                    secondary: 'hsl(var(--destructive-foreground))',
                  },
                },
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;