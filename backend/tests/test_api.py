"""
Automated Test Suite for NextTwin Backend & ML Pipeline.

Tests all REST API endpoints and ML predictor logic:
  - Authentication (register, login, get me)
  - Profile GET / PUT
  - Academic prediction + XAI schema check
  - Placement prediction + XAI schema check
  - Skill development prediction schema check
  - What-If simulator schema check
  - Career compatibility scoring
  - Personalized recommendations generator
"""
import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, engine, SessionLocal
from backend.models import User, StudentProfile
from backend.seed_demo_data import seed

class TestNextTwinAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create database and seed demo data
        seed()
        cls.client = TestClient(app)
        
        # Login to get JWT token
        res = cls.client.post("/auth/login", json={
            "email": "demo@nexttwin.com",
            "password": "Demo@1234"
        })
        assert res.status_code == 200, f"Login failed: {res.text}"
        token_data = res.json()
        cls.token = token_data["access_token"]
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    def test_01_auth_me(self):
        res = self.client.get("/auth/me", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["email"], "demo@nexttwin.com")

    def test_02_profile_get_and_update(self):
        res = self.client.get("/profile/", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        profile = res.json()
        self.assertIn("cgpa", profile)
        self.assertEqual(profile["degree"], "B.Tech")

        # Update profile
        update_res = self.client.put("/profile/", headers=self.headers, json={
            "attendance": 88.0,
            "dsa": 5.0
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["attendance"], 88.0)

    def test_03_predict_academic(self):
        res = self.client.get("/predict/academic", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("current_cgpa", data)
        self.assertIn("predicted_cgpa", data)
        self.assertIn("trend", data)
        self.assertIn("feature_contributions", data)

    def test_04_predict_placement(self):
        res = self.client.get("/predict/placement", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("placement_readiness", data)
        self.assertIsInstance(data["placement_readiness"], float)
        self.assertIn("positive_factors", data)
        self.assertIn("negative_factors", data)
        self.assertIn("feature_contributions", data)

    def test_05_predict_skills(self):
        res = self.client.get("/predict/skills", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("growth_factor", data)
        self.assertIn("improvements", data)
        self.assertGreater(len(data["improvements"]), 0)

    def test_06_whatif_simulate(self):
        payload = {
            "scenario_name": "Testing Scenario",
            "dsa": 8.0,
            "projects_count": 5
        }
        res = self.client.post("/whatif/simulate", headers=self.headers, json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("current", data)
        self.assertIn("scenario", data)
        self.assertIn("improvement", data)
        self.assertIn("changed_features", data)

    def test_07_career_compatibility(self):
        res = self.client.get("/career/compatibility", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("recommended_role", data)
        self.assertIn("roles", data)
        self.assertEqual(len(data["roles"]), 8)

    def test_08_recommendations(self):
        res = self.client.get("/recommendations/", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("recommendations", data)
        self.assertIn("profile_summary", data)

    def test_09_unauthenticated_request_fails(self):
        res = self.client.get("/profile/")
        self.assertEqual(res.status_code, 401)  # HTTPBearer returns 401 if missing header

    def test_10_career_gap_analysis(self):
        res = self.client.get("/career/gap?role=Software+Developer", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("target_role", data)
        self.assertIn("career_readiness", data)
        self.assertIn("matrix", data)

    def test_11_top3_actions(self):
        res = self.client.get("/recommendations/top3", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("top3", data)

    def test_12_roadmap(self):
        res = self.client.get("/recommendations/roadmap", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("progression", data)
        self.assertIn("roadmap", data)

    def test_13_evolution(self):
        res = self.client.get("/profile/evolution", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("timeline", data)



if __name__ == "__main__":
    unittest.main()
