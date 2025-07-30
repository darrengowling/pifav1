import requests
import sys
import json
from datetime import datetime

class SportXAPITester:
    def __init__(self, base_url="https://5047e2a6-53c6-426a-af88-990590a8dabe.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(response_data) <= 5:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_players_endpoints(self):
        """Test all player-related endpoints"""
        print("\n📋 Testing Player Endpoints...")
        
        # Get all players
        success, players = self.run_test(
            "Get All Players",
            "GET",
            "players",
            200
        )
        if not success or not players:
            return False
            
        print(f"   Found {len(players)} players")
        
        # Test specific player (Virat Kohli - ID 1)
        success, player = self.run_test(
            "Get Virat Kohli (ID: 1)",
            "GET",
            "players/1",
            200
        )
        if success and player:
            print(f"   Player: {player.get('name', 'Unknown')} - {player.get('position', 'Unknown')}")
            print(f"   Rating: {player.get('rating', 0)}/100, Price: ${player.get('price', 0):,}")
        
        # Test player search
        success, search_results = self.run_test(
            "Search Players (Kohli)",
            "GET",
            "players?search=Kohli",
            200
        )
        
        # Test position filter
        success, batsmen = self.run_test(
            "Filter Batsmen",
            "GET",
            "players?position=Batsman",
            200
        )
        
        return True

    def test_tournaments_endpoints(self):
        """Test tournament-related endpoints"""
        print("\n🏆 Testing Tournament Endpoints...")
        
        # Get all tournaments
        success, tournaments = self.run_test(
            "Get All Tournaments",
            "GET",
            "tournaments",
            200
        )
        if success:
            print(f"   Found {len(tournaments)} tournaments")
        
        return success

    def test_auctions_endpoints(self):
        """Test auction-related endpoints"""
        print("\n🔨 Testing Auction Endpoints...")
        
        # Get all auctions
        success, auctions = self.run_test(
            "Get All Auctions",
            "GET",
            "auctions",
            200
        )
        if success:
            print(f"   Found {len(auctions)} auctions")
        
        return success

    def test_live_stats(self):
        """Test live statistics endpoint"""
        print("\n📊 Testing Live Stats...")
        
        success, stats = self.run_test(
            "Get Live Stats",
            "GET",
            "stats/live",
            200
        )
        if success and stats:
            print(f"   Total Users: {stats.get('total_users', 0)}")
            print(f"   Online Users: {stats.get('online_users', 0)}")
            print(f"   Active Auctions: {stats.get('active_auctions', 0)}")
            print(f"   Total Tournaments: {stats.get('total_tournaments', 0)}")
            print(f"   WebSocket Connections: {stats.get('websocket_connections', 0)}")
        
        return success

    def test_authentication_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test registration
        test_user_data = {
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        success, user_response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and user_response:
            self.user_id = user_response.get('id')
            print(f"   Registered user: {user_response.get('username')}")
        
        # Test login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        success, login_response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and login_response:
            self.token = login_response.get('access_token')
            print(f"   Login successful, token received")
        
        # Test profile access (requires authentication)
        if self.token:
            success, profile = self.run_test(
                "Get User Profile",
                "GET",
                "auth/profile",
                200
            )
            if success and profile:
                print(f"   Profile: {profile.get('username')} - {profile.get('email')}")
        
        return success

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n❌ Testing Error Handling...")
        
        # Test invalid player ID
        success, _ = self.run_test(
            "Invalid Player ID (999)",
            "GET",
            "players/999",
            404
        )
        
        # Test invalid tournament ID
        success2, _ = self.run_test(
            "Invalid Tournament ID (999)",
            "GET",
            "tournaments/999",
            404
        )
        
        return success and success2

def main():
    print("🏏 SportX Cricket Auction API Testing")
    print("=" * 50)
    
    # Setup
    tester = SportXAPITester()
    
    # Run all tests
    print("\n🚀 Starting API Tests...")
    
    # Basic API tests
    tester.test_api_root()
    tester.test_players_endpoints()
    tester.test_tournaments_endpoints()
    tester.test_auctions_endpoints()
    tester.test_live_stats()
    
    # Authentication tests
    tester.test_authentication_endpoints()
    
    # Error handling tests
    tester.test_error_handling()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed} test(s) failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())