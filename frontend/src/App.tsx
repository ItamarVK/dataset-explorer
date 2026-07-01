import { useState } from 'react';
import './index.css';
import { FeedbackLoader } from './components/FeedbackLoader';
import { UploadArea } from './components/UploadArea';
import { DataGrid } from './components/DataGrid';
import { AIPrompt } from './components/AIPrompt';

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dataset-explorer-backend-ntvm.onrender.com';

  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [question, setQuestion] = useState("");
  const [askError, setAskError] = useState<string | null>(null);
  
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }
    setUploadError(null);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await res.json(); 
      
      // Fetch rows
      const rowsRes = await fetch(`${API_BASE_URL}/rows?limit=100&offset=0`);
      if (rowsRes.ok) {
        const rowsData = await rowsRes.json();
        setRows(rowsData.data);
        setColumns(data.columns);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setAskError("Question cannot be empty");
      return;
    }
    setAskError(null);
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      if (!res.ok) {
        throw new Error('AI request failed');
      }
      
      const data = await res.json();
      setSqlQuery(data.sql_query);
      setAiAnswer(data.answer);
    } catch (err) {
      setAskError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
      setFile(null);
      setUploadError(null);
      setAskError(null);
      setQuestion("");
      setRows([]);
      setColumns([]);
      setSqlQuery(null);
      setAiAnswer(null);
  };

  return (
    <>
      {loading && <FeedbackLoader />}
      
      <div className="app-container">
        <header className="app-header">
          <h1>Dataset Explorer</h1>
        </header>
        
        <main className="app-main">
          <UploadArea 
            file={file} 
            setFile={setFile} 
            uploadError={uploadError} 
            setUploadError={setUploadError} 
            handleUpload={handleUpload} 
            handleClear={handleClear} 
          />

          <DataGrid rows={rows} columns={columns} />

          <AIPrompt 
            question={question} 
            setQuestion={setQuestion} 
            askError={askError} 
            setAskError={setAskError} 
            handleAsk={handleAsk} 
            sqlQuery={sqlQuery}
            aiAnswer={aiAnswer}
          />
        </main>
      </div>
    </>
  );
}

export default App;
