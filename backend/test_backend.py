#!/usr/bin/env python3
"""
Basic test script to verify FastAPI backend functionality.
This script tests the basic structure without requiring a database connection.
"""

import sys
import json
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_imports():
    """Test that all modules can be imported."""
    try:
        # Test core imports
        from app.core.config import settings
        from app.core.security import get_password_hash, verify_password, generate_tokens
        
        # Test model imports
        from app.models.user import User, UserRole
        from app.models.project import Project, ProjectStatus, ProjectPriority
        
        # Test schema imports
        from app.schemas.user import UserCreate, UserRead, UserLogin
        from app.schemas.project import ProjectCreate, ProjectRead
        
        # Test API imports
        from app.api.deps import get_current_user
        from app.api.routes import auth, users, projects
        
        # Test main app
        from app.main import app
        
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_security_functions():
    """Test security functions."""
    try:
        from app.core.security import get_password_hash, verify_password, generate_tokens
        
        # Test password hashing
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        if not verify_password(password, hashed):
            raise Exception("Password verification failed")
        
        if verify_password("wrongpassword", hashed):
            raise Exception("Wrong password verification should fail")
        
        # Test token generation
        tokens = generate_tokens(1, "test@example.com", "user")
        if not tokens.get("accessToken") or not tokens.get("refreshToken"):
            raise Exception("Token generation failed")
        
        print("✅ Security functions work correctly")
        return True
    except Exception as e:
        print(f"❌ Security function test failed: {e}")
        return False

def test_models():
    """Test model definitions."""
    try:
        from app.models.user import User, UserRole
        from app.models.project import Project, ProjectStatus, ProjectPriority
        
        # Test enums
        assert UserRole.USER == "user"
        assert UserRole.MANAGER == "manager"
        assert UserRole.ADMIN == "admin"
        
        assert ProjectStatus.PLANNING == "planning"
        assert ProjectStatus.ACTIVE == "active"
        
        assert ProjectPriority.LOW == "low"
        assert ProjectPriority.HIGH == "high"
        
        print("✅ Model definitions are correct")
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def test_schemas():
    """Test Pydantic schemas."""
    try:
        from app.schemas.user import UserCreate, UserLogin
        from app.schemas.project import ProjectCreate, LocationBase
        
        # Test user schema
        user_data = {
            "firstName": "John",
            "lastName": "Doe", 
            "email": "john@example.com",
            "password": "password123"
        }
        user_create = UserCreate(**user_data)
        assert user_create.firstName == "John"
        
        # Test location schema
        location_data = {
            "address": "123 Main St",
            "city": "Anytown",
            "state": "CA",
            "zipCode": "12345"
        }
        location = LocationBase(**location_data)
        assert location.city == "Anytown"
        
        print("✅ Schema validation works correctly")
        return True
    except Exception as e:
        print(f"❌ Schema test failed: {e}")
        return False

def test_config():
    """Test configuration."""
    try:
        from app.core.config import settings
        
        # Test that settings can be accessed
        assert hasattr(settings, 'ENVIRONMENT')
        assert hasattr(settings, 'PORT')
        assert hasattr(settings, 'JWT_SECRET')
        assert hasattr(settings, 'DATABASE_URL')
        
        print(f"✅ Configuration loaded - Environment: {settings.ENVIRONMENT}")
        return True
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_api_responses():
    """Test API response format."""
    try:
        from app.api.routes.auth import create_response
        
        # Test success response
        response = create_response(True, "Test message", {"test": "data"})
        expected = {
            "success": True,
            "message": "Test message", 
            "data": {"test": "data"}
        }
        assert response == expected
        
        # Test error response
        response = create_response(False, "Error message")
        expected = {
            "success": False,
            "message": "Error message"
        }
        assert response == expected
        
        print("✅ API response format is correct")
        return True
    except Exception as e:
        print(f"❌ API response test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing FastAPI Backend...")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_config,
        test_models,
        test_schemas,
        test_security_functions,
        test_api_responses
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready.")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())