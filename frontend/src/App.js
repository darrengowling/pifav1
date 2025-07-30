import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast, { Toaster } from 'react-hot-toast';
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import Auctions from "./pages/Auctions";
import AuctionRoom from "./pages/AuctionRoom";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

// Debug component to show current route
function RouteDebugger() {
  const location = useLocation();
  console.log('Current route:', location.pathname);
  return (
    <div className="fixed top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs z-50">
      Route: {location.pathname}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <RouteDebugger />
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auction/:playerId" element={<AuctionRoom />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;