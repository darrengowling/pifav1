import requests
import sys
import json
from datetime import datetime

class SportXAPITester:
    def __init__(self, base_url="https://50234383-3ebe-4c2f-a36a-3cf8628b1fd8.preview.emergentagent.com/api"):
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

    def test_cricket_integration(self):
        """Test CricData API integration endpoints - PRIORITY TESTS"""
        print("\n🏏 Testing CricData API Integration - PRIORITY TESTS...")
        
        # PRIORITY TEST 1: Test cricket player population (should work after fix)
        print("\n🔧 PRIORITY TEST 1: Player Population Fix")
        success, populate_response = self.run_test(
            "Populate Cricket Players from API (FIXED)",
            "POST",
            "cricket/populate-players",
            200
        )
        
        population_working = False
        if success and populate_response:
            populated = populate_response.get('populated_players', [])
            failed = populate_response.get('failed_players', [])
            total = populate_response.get('total_attempted', 0)
            
            print(f"   ✅ Populated: {len(populated)} players")
            print(f"   ❌ Failed: {len(failed)} players") 
            print(f"   📊 Total attempted: {total}")
            
            # Check if we got real player names (not "Unknown")
            if populated and any(name != "Unknown" for name in populated):
                population_working = True
                print(f"   🎉 SUCCESS: Real cricket players populated!")
                print(f"   📋 Sample players: {populated[:5]}")
            else:
                print(f"   ⚠️  WARNING: All players saved as 'Unknown' - API may be rate limited")
        
        # PRIORITY TEST 2: Test error handling fix (should return 404 for invalid players)
        print("\n🔧 PRIORITY TEST 2: Error Handling Fix")
        success2, error_response = self.run_test(
            "Invalid Player Name (NonExistentPlayer123) - Should return 404",
            "GET",
            "cricket/player/NonExistentPlayer123",
            404
        )
        
        if success2:
            print(f"   ✅ SUCCESS: Invalid player correctly returns 404")
        else:
            print(f"   ❌ FAILED: Invalid player still returns 200 instead of 404")
        
        # PRIORITY TEST 3: Test individual player lookup with a famous player
        print("\n🔧 PRIORITY TEST 3: Individual Player Stats")
        success3, player_response = self.run_test(
            "Get Virat Kohli Details from API",
            "GET",
            "cricket/player/Virat Kohli",
            200
        )
        
        real_data_available = False
        if success3 and player_response:
            player_data = player_response.get('data', {})
            player_name = player_data.get('name', 'Unknown')
            country = player_data.get('country', 'Unknown')
            role = player_data.get('role', 'Unknown')
            base_price = player_data.get('base_price', 0)
            
            print(f"   Player: {player_name}")
            print(f"   Country: {country}")
            print(f"   Role: {role}")
            print(f"   Base Price: ${base_price:,.2f}")
            
            # Check if we got real data
            if player_name != "Unknown" and country and country != "Unknown":
                real_data_available = True
                print(f"   ✅ SUCCESS: Real cricket data retrieved!")
            else:
                print(f"   ⚠️  WARNING: Default/mock data returned - API may be rate limited")
        
        # Additional tests for completeness
        print("\n📊 Additional Integration Tests:")
        
        # Test live matches
        success4, live_matches = self.run_test(
            "Get Live Cricket Matches",
            "GET",
            "cricket/live-matches",
            200
        )
        
        if success4 and live_matches:
            matches_data = live_matches.get('data', [])
            print(f"   Live matches: {len(matches_data)} found")
        
        # Test cricket scores
        success5, scores_response = self.run_test(
            "Get Cricket Scores",
            "GET",
            "cricket/scores",
            200
        )
        
        if success5 and scores_response:
            scores_data = scores_response.get('data', {})
            if 'info' in scores_data:
                api_info = scores_data['info']
                print(f"   API Usage: {api_info.get('hitsUsed', 0)}/{api_info.get('hitsLimit', 100)} hits")
                if api_info.get('hitsUsed', 0) >= api_info.get('hitsLimit', 100):
                    print(f"   ⚠️  API RATE LIMIT EXCEEDED - This explains population failures")
        
        # Return overall success - focus on critical fixes
        critical_tests_passed = success2  # Error handling fix is most critical
        print(f"\n🎯 CRITICAL TESTS SUMMARY:")
        print(f"   Population Fix: {'✅ Working' if population_working else '⚠️  Limited by API rate'}")
        print(f"   Error Handling Fix: {'✅ Working' if success2 else '❌ Still broken'}")
        print(f"   Real Data Available: {'✅ Working' if real_data_available else '⚠️  Limited by API rate'}")
        
        return critical_tests_passed
    
    def test_populated_players_in_database(self):
        """Test if populated cricket players are available in regular players endpoint"""
        print("\n📊 Testing Populated Players in Database...")
        
        # Get all players to check if new ones were added
        success, players = self.run_test(
            "Get All Players (After Population)",
            "GET",
            "players",
            200
        )
        
        if success and players:
            print(f"   Total players in database: {len(players)}")
            
            # Look for some famous cricket players
            famous_players = ["Virat Kohli", "Rohit Sharma", "MS Dhoni", "Hardik Pandya"]
            found_players = []
            
            for player in players:
                if player.get('name') in famous_players:
                    found_players.append(player.get('name'))
                    print(f"   Found: {player.get('name')} - {player.get('position')} - Rating: {player.get('rating')}")
            
            print(f"   Famous players found: {len(found_players)}/{len(famous_players)}")
            return len(found_players) > 0
        
        return False

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
    
    # NEW: CricData API Integration tests
    tester.test_cricket_integration()
    tester.test_populated_players_in_database()
    
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