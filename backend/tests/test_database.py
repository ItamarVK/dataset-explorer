import pytest
from database import execute_sql

def test_execute_sql_prevents_drop_table():
    with pytest.raises(ValueError, match="Only SELECT queries are allowed"):
        execute_sql("DROP TABLE dataset")

def test_execute_sql_prevents_insert():
    with pytest.raises(ValueError, match="Only SELECT queries are allowed"):
        execute_sql("INSERT INTO dataset (id) VALUES (1)")
        
def test_execute_sql_prevents_delete():
    with pytest.raises(ValueError, match="Only SELECT queries are allowed"):
        execute_sql("DELETE FROM dataset WHERE id=1")
