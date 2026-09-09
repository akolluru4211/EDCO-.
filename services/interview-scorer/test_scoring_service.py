import json
import pytest
from app import app, INTERNAL_SERVICE_SECRET

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    """Verifies Kubernetes health/readiness probe."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "flask-interview-scorer"

def test_unauthenticated_request_rejected(client):
    """Verifies that requests without internal secret are rejected (HTTP 401)."""
    res = client.post("/score-interview", json={"videoUrl": "https://sample.mp4"})
    assert res.status_code == 401
    assert "Unauthorized" in res.get_json()["error"]

def test_successful_scoring_pipeline(client):
    """Verifies end-to-end compute with valid internal auth."""
    payload = {
        "videoUrl": "https://edworld.storage/interview1.mp4",
        "questionCategory": "swe",
        "effectiveLevel": 2,
        "transcript": "I built a microservices system with PostgreSQL, React, and Docker to reduce latency."
    }
    headers = {"X-Internal-Service-Key": INTERNAL_SERVICE_SECRET}
    res = client.post("/score-interview", json=payload, headers=headers)
    
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["contentScore"] is not None
    assert data["voiceScore"] is not None
    assert data["overallScore"] >= 50
    assert "pipelineStatus" in data
    assert data["pipelineStatus"]["contentScoring"] == "success"

def test_face_api_independent_failure(client):
    """Verifies that face analysis API failure returns expressionScore: None without breaking core scores."""
    payload = {
        "videoUrl": "https://edworld.storage/fail_face_test.mp4",
        "questionCategory": "swe",
        "effectiveLevel": 1,
        "transcript": "I led the cross-functional team to deploy the new platform on Kubernetes."
    }
    headers = {"X-Internal-Service-Key": INTERNAL_SERVICE_SECRET}
    res = client.post("/score-interview", json=payload, headers=headers)
    
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["expressionScore"] is None
    assert data["pipelineStatus"]["faceAnalysis"] == "failed"
    # Core scores remain intact!
    assert data["contentScore"] is not None
    assert data["voiceScore"] is not None
