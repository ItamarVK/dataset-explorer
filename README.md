# Dataset Explorer (AI-Powered)

## Architecture Overview
A full-stack application built with FastAPI (Python) and React (Vite). The backend is structured to separate routing, database interaction, and AI intelligence for high maintainability.

We use a **two-step "Text-to-SQL" pipeline** to process user queries without exposing raw data:
1. **Prompt 1 (SQL Generation):** The database schema is injected into the LLM prompt to generate a secure `SELECT` query based on the user's natural language question.
2. **Execution:** The SQL query is safely executed locally on an in-memory SQLite database (`data.db`) created from the uploaded CSV.
3. **Prompt 2 (Summarization):** The raw query results and original question are sent back to the LLM to format a conversational answer.

## Environment Variables
The backend requires environment variables for secure configuration. Never commit these secrets to the repository.

- `GEMINI_API_KEY`: Your Google Gemini API key. This is required for the LLM pipeline to generate SQL and answer queries. Create a `.env` file in the `backend` directory and add: `GEMINI_API_KEY=your_key_here`.

## How to Run Locally

### Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create the `.env` file with your `GEMINI_API_KEY`.
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## How to Deploy

### Backend Deployment (e.g., Render)
1. Connect your GitHub repository to Render (or a similar service) and create a new **Web Service** pointing to the `backend` directory.
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
4. **Environment Variables:** You MUST set the `GEMINI_API_KEY` in your hosting provider's dashboard.

### Frontend Deployment (e.g., Vercel)
1. Connect your GitHub repository to Vercel (or a similar service) and point it to the `frontend` directory.
2. Set the Framework Preset to **Vite**.
3. **Build Command:** `npm run build`
4. Deploy. Vercel will automatically host the static frontend on a public URL. Ensure the frontend is configured to communicate with your live backend URL.

## What I'd do next
Given more time, here are the top improvements I would prioritize:
- **In-App Data Editing**: Enable users to directly modify and delete dataset records within the application.
- **Advanced Visualization**: Automatically generate graphs and charts to visually represent the query results alongside the AI's answers.
- **Streaming AI Responses**: Display the AI's response in real-time as it thinks, creating a faster and smoother user experience.
- **User Authentication**: Introduce personal accounts so users can securely store and manage their own private datasets.
- **Handle Complicated AI Questions**: Expand the AI's capabilities to accurately answer highly complex analytical queries (like calculating percentiles or finding the worker with the median salary).
