#!/usr/bin/env python3
"""
Test script to verify Python module imports work correctly.
This script tests the imports mentioned in the problem statement.
"""

def test_imports():
    """Test that all modules can be imported successfully."""
    try:
        # Test the imports mentioned in the problem statement
        from actions.adb import ADBController
        from vision.processor import VisionProcessor  
        from planner.strategy import Planner
        
        print("✅ All imports successful!")
        
        # Basic functionality test
        adb = ADBController()
        vision = VisionProcessor()
        planner = Planner()
        
        print("✅ All modules instantiated successfully!")
        
        # Simple functionality tests
        assert adb.connect() == True
        assert vision.process_image("test.jpg") == "Processed: test.jpg"
        assert planner.create_plan(["objective1"]) is not None
        
        print("✅ All module functions working correctly!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    exit(0 if success else 1)