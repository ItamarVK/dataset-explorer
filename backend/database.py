import sqlite3
import pandas as pd
import io

DB_FILE = "data.db"
TABLE_NAME = "dataset"

def get_connection():
    return sqlite3.connect(DB_FILE)

def load_csv_to_sqlite(csv_bytes: bytes) -> tuple[int, list[str]]:
    df = pd.read_csv(io.BytesIO(csv_bytes))
    conn = get_connection()
    df.to_sql(TABLE_NAME, conn, if_exists="replace", index=False)
    conn.close()
    return len(df), list(df.columns)

def get_rows(limit: int, offset: int, filter_col: str = None, filter_val: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (TABLE_NAME,))
    if not cursor.fetchone():
        conn.close()
        return [], 0
        
    query = f"SELECT * FROM {TABLE_NAME}"
    params = []
    
    if filter_col and filter_val:
        cursor.execute(f"PRAGMA table_info({TABLE_NAME})")
        columns = [row[1] for row in cursor.fetchall()]
        if filter_col not in columns:
            conn.close()
            raise ValueError(f"Invalid filter column: {filter_col}")
            
        query += f" WHERE [{filter_col}] LIKE ?"
        params.append(f"%{filter_val}%")
        
    count_query = f"SELECT COUNT(*) FROM ({query})"
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]
    
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df.to_dict(orient="records"), total

def get_schema() -> str:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (TABLE_NAME,))
    if not cursor.fetchone():
        conn.close()
        return ""
    
    cursor.execute(f"PRAGMA table_info({TABLE_NAME})")
    columns = [f"{row[1]} ({row[2]})" for row in cursor.fetchall()]
    conn.close()
    return f"Table {TABLE_NAME} with columns: " + ", ".join(columns)

def execute_sql(sql: str) -> list[dict]:
    if not sql.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed for safety.")
        
    conn = get_connection()
    try:
        df = pd.read_sql_query(sql, conn)
        return df.to_dict(orient="records")
    finally:
        conn.close()
