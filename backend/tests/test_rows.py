import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_data():
    csv_content = b"id,name,age\n1,Alice,30\n2,Bob,25\n3,Charlie,35"
    client.post("/upload", files={"file": ("test.csv", csv_content, "text/csv")})
    yield

def test_get_rows_success():
    response = client.get("/rows")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 3
    assert data["total"] == 3

def test_get_rows_pagination():
    response = client.get("/rows?limit=2&offset=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2
    assert data["data"][0]["name"] == "Bob"

def test_get_rows_filtering():
    response = client.get("/rows?filter_col=name&filter_val=Alice")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["name"] == "Alice"

def test_get_rows_negative_limit():
    response = client.get("/rows?limit=-5")
    assert response.status_code == 422

def test_get_rows_negative_offset():
    response = client.get("/rows?offset=-1")
    assert response.status_code == 422

def test_get_rows_invalid_filter_column():
    response = client.get("/rows?filter_col=nonexistent&filter_val=123")
    # Should not throw 500 internal server error. Should validate column exists.
    assert response.status_code == 400
