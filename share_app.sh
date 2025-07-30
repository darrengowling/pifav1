#!/bin/bash

echo "🏏 SportX Cricket Auction - Friend Testing Setup"
echo "================================================"
echo ""

# Check if services are running
if ! pgrep -f "react-scripts start" > /dev/null; then
    echo "❌ Frontend not running. Starting services..."
    sudo supervisorctl restart all
    sleep 10
fi

echo "✅ Services are running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8001"
echo ""

# Get the current public URL
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*' | grep https | cut -d'"' -f4 | head -n1)

if [ -z "$FRONTEND_URL" ]; then
    echo "🚀 Starting ngrok tunnel..."
    echo ""
    echo "⚠️  IMPORTANT: You'll need to:"
    echo "   1. Sign up for free at: https://ngrok.com/"  
    echo "   2. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo "   3. Then run: ngrok http 3000"
    echo ""
    echo "Or continue reading for alternative options..."
else
    echo "🎉 Your app is already live at:"
    echo "   $FRONTEND_URL"
    echo ""
    echo "📱 Share this link with your friends!"
fi

echo ""
echo "🎮 Testing Instructions for Friends:"
echo "=================================="
echo ""
echo "1. TOURNAMENT ADMIN (You):"
echo "   • Go to Tournaments page"
echo "   • Click 'Create Tournament'"  
echo "   • Set up: Name, Budget ($100k recommended), Max 8 players"
echo "   • Share your INVITE CODE with friends"
echo ""
echo "2. FRIENDS (Players):"
echo "   • Open the shared URL"
echo "   • Go to Tournaments → Enter invite code"
echo "   • Wait for admin to start auction"
echo ""  
echo "3. LIVE AUCTION:"
echo "   • Admin clicks 'Start Auction'"
echo "   • Everyone joins auction room"
echo "   • Bid on cricket players (Virat Kohli, MS Dhoni, etc.)"
echo "   • Use quick bid buttons (+$25K, +$50K, +$100K)"
echo ""
echo "🏆 Tournament Features to Test:"
echo "   ✓ Real-time bidding"
echo "   ✓ WebSocket connections" 
echo "   ✓ Achievement system"
echo "   ✓ Mobile responsiveness"
echo "   ✓ Invite sharing"
echo ""
echo "📝 Feedback Areas:"
echo "   • Ease of joining tournaments"
echo "   • Auction room experience"
echo "   • Mobile vs desktop performance"
echo "   • Any bugs or confusing UI"
echo ""