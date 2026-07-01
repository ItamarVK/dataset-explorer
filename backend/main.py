from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
import database
import llm_service

app = FastAPI(title="Dataset Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format. Only CSV allowed.")
    
    content = await file.read()
    if not content.strip():
        raise HTTPException(status_code=400, detail="Empty file")
    
    try:
        rows, columns = database.load_csv_to_sqlite(content)
        return {
            "message": "File uploaded successfully",
            "rows": rows,
            "columns": columns
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rows")
async def get_rows(
    limit: int = Query(100, ge=1), 
    offset: int = Query(0, ge=0),
    filter_col: Optional[str] = None,
    filter_val: Optional[str] = None
):
    try:
        data, total = database.get_rows(limit, offset, filter_col, filter_val)
        return {"data": data, "total": total}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty")
    
    try:
        schema = database.get_schema()
        if not schema:
            raise HTTPException(status_code=400, detail="No dataset uploaded yet.")
            
        sql_query = llm_service.generate_sql(schema, request.question)
        query_results = database.execute_sql(sql_query)
        answer = llm_service.generate_summary(request.question, sql_query, query_results)
        
        return {
            "sql_query": sql_query,
            "answer": answer
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
