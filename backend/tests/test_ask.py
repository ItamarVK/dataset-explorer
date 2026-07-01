import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_data():
    csv_content = b"id,name,age\n1,Alice,30\n2,Bob,25\n3,Charlie,35"
    client.post("/upload", files={"file": ("test.csv", csv_content, "text/csv")})
    yield

def test_ask_success():
    payload = {"question": "What is the average age?"}
    response = client.post("/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sql_query" in data

def test_ask_empty_question():
    payload = {"question": ""}
    response = client.post("/ask", json=payload)
    assert response.status_code == 422

def test_ask_missing_question_field():
    payload = {"wrong_key": "What?"}
    response = client.post("/ask", json=payload)
    assert response.status_code == 422

import os
from unittest.mock import patch

def test_ask_api_failure_handling():
    with patch.dict(os.environ, {"TEST_MODE": "0", "GEMINI_API_KEY": "dummy"}):
        with patch("llm_service._get_client") as mock_client:
            mock_client.return_value.models.generate_content.side_effect = Exception("Gemini Timeout")
            payload = {"question": "What is the maximum age?"}
            response = client.post("/ask", json=payload)
            assert response.status_code == 503, response.text

def test_ask_api_caching():
    with patch.dict(os.environ, {"TEST_MODE": "0", "GEMINI_API_KEY": "dummy"}):
        with patch("llm_service._get_client") as mock_client:
            mock_response = type("obj", (object,), {"text": "SELECT * FROM dataset"})
            mock_client.return_value.models.generate_content.return_value = mock_response
            
            payload = {"question": "How many rows are there?"}
            # Ask the same question twice
            client.post("/ask", json=payload)
            client.post("/ask", json=payload)
            
            # Since caching is active, the LLM should only be hit 2 times total
            # (once for SQL generation, once for summary generation) instead of 4 times.
            assert mock_client.return_value.models.generate_content.call_count == 2

