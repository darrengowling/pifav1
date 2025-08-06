#!/usr/bin/env python3
"""
Comprehensive Tournament Creation API Test
Tests the specific tournament creation functionality that was reported as problematic.
"""

import requests
import json
from datetime import datetime, timedelta

class TournamentCreationTester:
    def __init__(self, base_url="https://bf27662a-804b-4dfb-8a4f-4bf424dcdca1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.created_tournament_id = None
        
    def authenticate(self):
        """Create a test user and authenticate"""
        print("🔐 Setting up authentication...")
        
        # Create unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')
        test_user = {
            "username": f"tournament_creator_{timestamp}",
            "email": f"creator_{timestamp}@sportx.com",
            "password": "SecurePass123!"
        }
        
        # Register user
        register_response = requests.post(
            f"{self.base_url}/auth/register",
            json=test_user,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if register_response.status_code != 200:
            print(f"❌ Registration failed: {register_response.status_code}")
            return False
            
        user_data = register_response.json()
        self.user_id = user_data.get('id')
        print(f"✅ User registered: {user_data.get('username')}")
        
        # Login
        login_response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": test_user["email"], "password": test_user["password"]},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            return False
            
        login_data = login_response.json()
        self.token = login_data.get('access_token')
        print(f"✅ Authentication successful")
        return True
    
    def test_tournament_creation(self):
        """Test tournament creation with realistic data"""
        print("\n🏆 Testing Tournament Creation...")
        
        if not self.token:
            print("❌ No authentication token available")
            return False
            
        # Create tournament with realistic cricket tournament data
        tournament_data = {
            "name": "IPL 2024 Fantasy League",
            "description": "Fantasy cricket league based on IPL 2024 season",
            "real_life_tournament": "Indian Premier League 2024",
            "max_participants": 8,
            "budget": 10000000,  # 10 million budget
            "squad_composition": {
                "batsmen": 4,
                "bowlers": 4,
                "all_rounders": 2,
                "wicket_keepers": 2
            },
            "auction_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "auction_duration": 2.5
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        
        print(f"   Creating tournament: {tournament_data['name']}")
        print(f"   Max participants: {tournament_data['max_participants']}")
        print(f"   Budget: ${tournament_data['budget']:,}")
        
        response = requests.post(
            f"{self.base_url}/tournaments",
            json=tournament_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            tournament = response.json()
            self.created_tournament_id = tournament.get('id')
            print(f"✅ Tournament created successfully!")
            print(f"   Tournament ID: {self.created_tournament_id}")
            print(f"   Invite Code: {tournament.get('invite_code')}")
            print(f"   Status: {tournament.get('status')}")
            print(f"   Admin ID: {tournament.get('admin_id')}")
            print(f"   Participants: {len(tournament.get('participants', []))}")
            
            # Verify the creator is automatically added as participant
            participants = tournament.get('participants', [])
            if participants and participants[0].get('user_id') == self.user_id:
                print(f"✅ Creator automatically added as admin participant")
            else:
                print(f"⚠️  Creator not found in participants list")
                
            return True
        else:
            print(f"❌ Tournament creation failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Error: {response.text}")
            return False
    
    def test_tournament_retrieval(self):
        """Test retrieving the created tournament"""
        print("\n📋 Testing Tournament Retrieval...")
        
        if not self.created_tournament_id:
            print("❌ No tournament ID available for testing")
            return False
            
        # Test getting specific tournament
        response = requests.get(
            f"{self.base_url}/tournaments/{self.created_tournament_id}",
            timeout=10
        )
        
        if response.status_code == 200:
            tournament = response.json()
            print(f"✅ Tournament retrieved successfully")
            print(f"   Name: {tournament.get('name')}")
            print(f"   Status: {tournament.get('status')}")
            print(f"   Participants: {len(tournament.get('participants', []))}")
            return True
        else:
            print(f"❌ Tournament retrieval failed: {response.status_code}")
            return False
    
    def test_tournament_listing(self):
        """Test listing tournaments to verify it appears in the list"""
        print("\n📝 Testing Tournament Listing...")
        
        response = requests.get(f"{self.base_url}/tournaments", timeout=10)
        
        if response.status_code == 200:
            tournaments = response.json()
            print(f"✅ Tournament listing successful")
            print(f"   Total tournaments: {len(tournaments)}")
            
            # Check if our created tournament is in the list
            if self.created_tournament_id:
                found = any(t.get('id') == self.created_tournament_id for t in tournaments)
                if found:
                    print(f"✅ Created tournament found in listing")
                else:
                    print(f"⚠️  Created tournament not found in listing")
            
            return True
        else:
            print(f"❌ Tournament listing failed: {response.status_code}")
            return False
    
    def test_tournament_join_flow(self):
        """Test joining a tournament with invite code"""
        print("\n🤝 Testing Tournament Join Flow...")
        
        if not self.created_tournament_id or not self.token:
            print("❌ Missing tournament ID or authentication")
            return False
            
        # First, get the tournament to get the invite code
        tournament_response = requests.get(
            f"{self.base_url}/tournaments/{self.created_tournament_id}",
            timeout=10
        )
        
        if tournament_response.status_code != 200:
            print("❌ Could not retrieve tournament for invite code")
            return False
            
        tournament = tournament_response.json()
        invite_code = tournament.get('invite_code')
        
        if not invite_code:
            print("❌ No invite code found in tournament")
            return False
            
        print(f"   Using invite code: {invite_code}")
        
        # Create another user to test joining
        timestamp = datetime.now().strftime('%H%M%S%f')
        joiner_user = {
            "username": f"tournament_joiner_{timestamp}",
            "email": f"joiner_{timestamp}@sportx.com",
            "password": "SecurePass123!"
        }
        
        # Register joiner
        register_response = requests.post(
            f"{self.base_url}/auth/register",
            json=joiner_user,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if register_response.status_code != 200:
            print("❌ Could not register joiner user")
            return False
            
        # Login joiner
        login_response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": joiner_user["email"], "password": joiner_user["password"]},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print("❌ Could not login joiner user")
            return False
            
        joiner_token = login_response.json().get('access_token')
        
        # Attempt to join tournament
        join_response = requests.post(
            f"{self.base_url}/tournaments/{self.created_tournament_id}/join",
            json={"invite_code": invite_code},
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {joiner_token}'
            },
            timeout=10
        )
        
        if join_response.status_code == 200:
            updated_tournament = join_response.json()
            participants = updated_tournament.get('participants', [])
            print(f"✅ Tournament join successful")
            print(f"   Total participants: {len(participants)}")
            return True
        else:
            print(f"❌ Tournament join failed: {join_response.status_code}")
            try:
                error_data = join_response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Error: {join_response.text}")
            return False

def main():
    print("🏏 SportX Tournament Creation API Test")
    print("=" * 50)
    
    tester = TournamentCreationTester()
    
    # Test sequence
    tests = [
        ("Authentication Setup", tester.authenticate),
        ("Tournament Creation", tester.test_tournament_creation),
        ("Tournament Retrieval", tester.test_tournament_retrieval),
        ("Tournament Listing", tester.test_tournament_listing),
        ("Tournament Join Flow", tester.test_tournament_join_flow),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running: {test_name}")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} - PASSED")
            else:
                print(f"❌ {test_name} - FAILED")
        except Exception as e:
            print(f"❌ {test_name} - ERROR: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"📊 Tournament Creation Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tournament creation tests passed! Backend API is working correctly.")
        return 0
    else:
        print(f"⚠️  {total - passed} test(s) failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())