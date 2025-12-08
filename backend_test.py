#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class CTPBackendTester:
    def __init__(self, base_url="https://ctp-academy.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"   Response: {response.text[:200]}", "FAIL")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "ERROR")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def setup_test_user(self):
        """Create a test user and session using MongoDB"""
        self.log("Setting up test user and session...")
        
        # Generate unique identifiers
        timestamp = int(time.time())
        self.user_id = f"test-user-{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        
        # MongoDB commands to create test user and session
        mongo_commands = f'''
        use('test_database');
        db.users.insertOne({{
          user_id: "{self.user_id}",
          email: "test.user.{timestamp}@example.com",
          name: "Test User {timestamp}",
          picture: "https://via.placeholder.com/150",
          role: "student",
          created_at: new Date().toISOString()
        }});
        db.user_sessions.insertOne({{
          user_id: "{self.user_id}",
          session_token: "{self.session_token}",
          expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          created_at: new Date().toISOString()
        }});
        '''
        
        try:
            import subprocess
            result = subprocess.run(['mongosh', '--eval', mongo_commands], 
                                  capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                self.log(f"✅ Test user created: {self.user_id}")
                self.log(f"✅ Session token: {self.session_token}")
                return True
            else:
                self.log(f"❌ Failed to create test user: {result.stderr}")
                return False
        except Exception as e:
            self.log(f"❌ Error creating test user: {str(e)}")
            return False

    def cleanup_test_user(self):
        """Clean up test user and session"""
        if not self.user_id:
            return
            
        self.log("Cleaning up test data...")
        mongo_commands = f'''
        use('test_database');
        db.users.deleteMany({{user_id: "{self.user_id}"}});
        db.user_sessions.deleteMany({{user_id: "{self.user_id}"}});
        '''
        
        try:
            import subprocess
            subprocess.run(['mongosh', '--eval', mongo_commands], 
                          capture_output=True, text=True, timeout=30)
            self.log("✅ Test data cleaned up")
        except Exception as e:
            self.log(f"⚠️  Cleanup warning: {str(e)}")

    def test_public_endpoints(self):
        """Test endpoints that don't require authentication"""
        self.log("=== Testing Public Endpoints ===")
        
        # Test courses endpoint (should work without auth for published courses)
        self.run_test("Get Published Courses", "GET", "courses", 200)
        
        # Test magazines endpoint (should be public)
        self.run_test("Get Magazines", "GET", "magazines", 200)

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("=== Testing Authentication Endpoints ===")
        
        # Test /auth/me with valid session
        success, user_data = self.run_test("Get Current User", "GET", "auth/me", 200)
        if success and user_data:
            self.log(f"✅ User authenticated: {user_data.get('name', 'Unknown')}")
            return True
        return False

    def test_course_endpoints(self):
        """Test course-related endpoints"""
        self.log("=== Testing Course Endpoints ===")
        
        # Get courses
        success, courses = self.run_test("Get All Courses", "GET", "courses", 200)
        
        if success and courses:
            # Test getting a specific course
            if len(courses) > 0:
                course_id = courses[0]['course_id']
                self.run_test("Get Course Details", "GET", f"courses/{course_id}", 200)
                
                # Test getting modules for the course
                self.run_test("Get Course Modules", "GET", f"courses/{course_id}/modules", 200)
                
                return course_id
        return None

    def test_enrollment_endpoints(self, course_id):
        """Test enrollment endpoints"""
        self.log("=== Testing Enrollment Endpoints ===")
        
        if not course_id:
            self.log("⚠️  Skipping enrollment tests - no course available")
            return
        
        # Test enrollment
        success, enrollment = self.run_test(
            "Enroll in Course", 
            "POST", 
            "enrollments", 
            200,  # Could be 200 for success or existing enrollment
            {"course_id": course_id}
        )
        
        # Get user's enrollments
        self.run_test("Get My Enrollments", "GET", "enrollments/my", 200)

    def test_certificate_endpoints(self):
        """Test certificate endpoints"""
        self.log("=== Testing Certificate Endpoints ===")
        
        # Get user's certificates
        self.run_test("Get My Certificates", "GET", "certificates/my", 200)

    def test_admin_endpoints(self):
        """Test admin endpoints (should fail for regular user)"""
        self.log("=== Testing Admin Endpoints (Should Fail) ===")
        
        # These should return 403 for non-admin users
        self.run_test("Get Admin Stats (Should Fail)", "GET", "admin/stats", 403)
        self.run_test("Get All Users (Should Fail)", "GET", "admin/users", 403)

    def test_logout(self):
        """Test logout endpoint"""
        self.log("=== Testing Logout ===")
        
        self.run_test("Logout", "POST", "auth/logout", 200)

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting CTP Backend API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        # Setup test user
        if not self.setup_test_user():
            self.log("❌ Failed to setup test user. Aborting tests.")
            return False
        
        try:
            # Test public endpoints first
            self.test_public_endpoints()
            
            # Test authentication
            if not self.test_auth_endpoints():
                self.log("❌ Authentication failed. Skipping protected endpoint tests.")
                return False
            
            # Test protected endpoints
            course_id = self.test_course_endpoints()
            self.test_enrollment_endpoints(course_id)
            self.test_certificate_endpoints()
            self.test_admin_endpoints()
            self.test_logout()
            
        finally:
            # Always cleanup
            self.cleanup_test_user()
        
        # Print summary
        self.log("=" * 50)
        self.log(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            self.log("❌ Failed Tests:")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                self.log(f"   - {test['test']}: {error_msg}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as success

def main():
    tester = CTPBackendTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())