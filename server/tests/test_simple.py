#!/usr/bin/env python3
"""
Simple test to verify spaces feature works
"""

import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def test_imports():
    """Test if we can import the app"""
    try:
        # Try different import styles
        try:
            from app import create_app
            print("✅ Import from 'app' successful")
        except ImportError:
            # Try relative import
            from .app import create_app
            print("✅ Import from '.app' successful")
        
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_api_endpoints():
    """Test if API endpoints respond"""
    import requests
    
    base_url = "http://localhost:5000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ /health endpoint works")
        else:
            print(f"⚠️ /health returned {response.status_code}")
    except:
        print("⚠️ Could not connect to /health (server may not be running)")
    
    # Test spaces endpoint
    try:
        response = requests.get(f"{base_url}/api/spaces", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ /api/spaces works - found {len(data)} spaces")
            return len(data)
        else:
            print(f"⚠️ /api/spaces returned {response.status_code}")
    except:
        print("⚠️ Could not connect to /api/spaces")

def main():
    print("🧪 Running simple tests for Spacer...")
    print("=" * 50)
    
    # Test imports
    imports_ok = test_imports()
    
    print("\n🔗 Testing API endpoints (requires server running):")
    test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("📋 Manual tests to run:")
    print("1. Visit http://localhost:5173/spaces - should show spaces")
    print("2. Visit http://localhost:5173/spaces/1 - should show space details")
    print("3. Visit http://localhost:5173/admin/spaces - should show admin page")
    print("4. Try adding/deleting spaces from admin page")
    
    if imports_ok:
        print("\n✅ Basic tests completed")
    else:
        print("\n⚠️ Some imports failed - check app structure")

if __name__ == "__main__":
    main()
