# Architecture & Evaluation Notes

This document explains the technical decisions made throughout the Dataset Explorer project, specifically mapping to the core evaluation criteria.

## 1. API Design Clarity (Endpoint Naming, Request/Response Shapes)
We designed a RESTful FastAPI backend with clear, distinct endpoints:
- **`POST /upload`**: Handles `multipart/form-data`. It returns a strict JSON shape `{"message": str, "rows": int, "columns": list}`. This ensures the frontend immediately knows the dataset schema upon success.
- **`GET /rows`**: A purely idempotent data retrieval endpoint. It uses query parameters (`limit`, `offset`, `filter_col`, `filter_val`) for pagination and filtering, following standard REST API conventions.
- **`POST /ask`**: Accepts a JSON payload `{"question": str}`. It separates the "command" of asking the AI from the data fetching. It returns `{"sql_query": str, "answer": str}`, providing transparency into the AI's internal process.
*All endpoints are guarded by granular `try/except` blocks returning specific HTTP status codes (e.g., 400 for bad data, 422 for empty questions, 503 for AI timeouts).*

## 2. React State Management and User Experience
We avoided complex external libraries (like Redux) in favor of clean, lifted React component state (using `useState`):
- **State Lifting**: The core data (`rows`, `columns`, `sqlQuery`, `aiAnswer`) lives in the top-level `App.tsx` orchestrator. This allows `App` to act as the single source of truth, passing data downward to pure, stateless components like `<DataGrid>`.
- **Feedback & Error States**: We implemented dedicated states (`loading`, `uploadError`, `askError`). When `loading` is true, a full-screen `<FeedbackLoader>` overlay is shown, preventing users from clicking buttons twice while the API responds.
- **Modularity & Aesthetics**: The monolithic structure was broken down into isolated functional components. The UI follows a strict "Clean and Clear" brutalist aesthetic (Nielsen's heuristics) with high-contrast elements and an "Emergency Exit" (Clear Data) button to reset state without refreshing.

## 3. LLM Prompt Structure and Handling
We utilized a secure, two-step "Text-to-SQL" pipeline using Google Gemini instead of sending raw data directly to the LLM (which is a privacy and token-limit risk).
- **Prompt 1 (SQL Generation)**: We feed the LLM the SQLite schema (`PRAGMA table_info`) and strict instructions to output *only* a valid `SELECT` query.
  - *Security*: We explicitly prompt the AI to ignore injection attempts (e.g., `DROP TABLE`) and wrap execution in a read-only database context.
- **Prompt 2 (Summarization)**: We execute the SQL locally, then pass the JSON results back to the LLM to format a friendly answer.
  - *Trust/Anti-Hallucination*: We explicitly prompt the AI: *"If the results are empty... state 'The data does not contain the answer'. Do not guess."*
- **Caching**: We use `functools.lru_cache` to memoize identical AI requests, saving network roundtrips and API costs.

## 4. Code Quality and README Clarity
- **Test-Driven Development (TDD)**: Every single feature was built test-first. The backend has 5 isolated `pytest` cases (including LLM mock failures), and the frontend has 8 `vitest` cases checking rendering, error handling, and `fetch` integrations.
- **Code Quality**: Code is modular, strongly typed (TypeScript interfaces, Python type hints), and well-separated (routing in `main.py`, SQL in `database.py`, AI in `llm_service.py`).
- **README Clarity**: The `README.md` provides explicit step-by-step instructions for running the backend and frontend separately. Crucially, it documents the strict security requirement of never committing API keys, detailing how to set up the `.env` file instead.
