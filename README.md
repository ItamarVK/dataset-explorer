# Dataset Explorer (AI-Powered)

A full-stack application built with **FastAPI** (Python) and **React** (Vite), designed to upload tabular data (CSVs), view the dataset, and ask natural language questions answered via an LLM SQL-generation pipeline (Google Gemini).

## 🏗 Architecture & API Design
The backend is structured to separate routing, database interaction, and AI intelligence for high maintainability.

### API Endpoints
- `POST /upload`
  - **Request:** `multipart/form-data` containing a `.csv` file.
  - **Action:** Parses CSV into an in-memory Pandas dataframe and writes it to a persistent local SQLite database (`data.db`).
  - **Response:** JSON containing `message`, `rows` (count), and `columns` (schema list).

- `GET /rows`
  - **Query Params:** `limit` (int, default 100), `offset` (int, default 0), `filter_col` (optional str), `filter_val` (optional str).
  - **Action:** Fetches rows from the SQLite database securely.
  - **Response:** JSON containing `data` (list of dictionaries) and `total` (total row count for pagination).

- `POST /ask`
  - **Request:** JSON `{"question": "What is the average age?"}`
  - **Action:** Uses the SQLite schema and the user's question to prompt Google Gemini. The LLM generates a clean `SELECT` SQL query. The backend safely executes this query locally, and feeds the results back to the LLM to generate a natural language summary.
  - **Response:** JSON `{"sql_query": "SELECT AVG(age)...", "answer": "The average age is 28."}`

## 🧠 LLM Prompt Structure
We use a **two-step "Text-to-SQL" pipeline** rather than uploading raw data to the LLM. This avoids token limits and strict privacy concerns.
1. **Prompt 1 (SQL Generation):** We inject the database schema (`PRAGMA table_info`) into the prompt and strictly request a `SELECT` query.
2. **Execution:** The SQL is executed safely on the local SQLite DB.
3. **Prompt 2 (Summarization):** The raw JSON results and the user's question are sent back to the LLM to format a friendly response.

## 🚀 Setup & TDD Execution

We used strict **Test-Driven Development (TDD)** to build this application. All features were built test-first.

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # (Windows)
pip install -r requirements.txt
```

> [!IMPORTANT]
> **Environment Configuration (Security Requirement):**
> Never commit API keys or credentials to the repository. The backend uses environment variables for all secrets. Create a `.env` file inside the `backend` directory containing the following:
> ```env
> GEMINI_API_KEY=your_google_gemini_api_key_here
> ```

*Run Backend Tests:*
```bash
pytest
```

*Run Backend Server:*
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
```

*Run Frontend Tests:*
```bash
npx vitest run
```

*Run Frontend Server:*
```bash
npm run dev
```

## 🌍 Deployment
This application is designed to be easily deployed using free cloud platforms.

1. **Backend Deployment (Render)**
   - Connect your GitHub repository to Render and create a new **Web Service** pointing to the `backend` directory.
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
   - **Environment Variables**: You MUST set `GEMINI_API_KEY` in Render's environment variable dashboard.

2. **Frontend Deployment (Vercel)**
   - Connect your GitHub repository to Vercel and point it to the `frontend` directory.
   - Set the Framework Preset to **Vite**.
   - Build Command: `npm run build`
   - Vercel will automatically build and host the static frontend on a public URL.

## 🔮 What I'd do next
Given more time, here are the top improvements I would prioritize:
- **In-App Data Editing**: Add an option to edit the dataset table directly from the app instead of just viewing it.
- **Advanced Filtering**: Add an option to apply multiple complex filters to the dataset at once.
- **Frontend Polish**: Clean up and refine the frontend design, ensuring the user interface is intuitive and polished.
- **AI Performance Tuning**: Look into ways to make the AI load faster, such as streaming responses directly to the user or optimizing the prompt structures.
