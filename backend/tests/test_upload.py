import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_upload_csv_success():
    csv_content = b"id,name,age\n1,Alice,30\n2,Bob,25"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    response = client.post("/upload", files=files)
    assert response.status_code == 200
    assert response.json()["message"] == "File uploaded successfully"
    assert response.json()["rows"] == 2
    assert response.json()["columns"] == ["id", "name", "age"]

def test_upload_invalid_file_type():
    txt_content = b"just some text"
    files = {"file": ("test.txt", txt_content, "text/plain")}
    response = client.post("/upload", files=files)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_upload_empty_file():
    files = {"file": ("empty.csv", b"", "text/csv")}
    response = client.post("/upload", files=files)
    assert response.status_code == 400

def test_upload_missing_file_payload():
    response = client.post("/upload")
    assert response.status_code == 422 # FastAPI validation should block this

def test_upload_malformed_csv():
    # Inconsistent columns should be handled gracefully by pandas
    csv_content = b"id,name\n1,Alice,30\n2"
    files = {"file": ("bad.csv", csv_content, "text/csv")}
    response = client.post("/upload", files=files)
    # Either parses it (200) or fails gracefully (400), but never 500
    assert response.status_code in [200, 400]
