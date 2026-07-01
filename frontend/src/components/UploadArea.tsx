interface UploadAreaProps {
  file: File | null;
  setFile: (file: File | null) => void;
  uploadError: string | null;
  setUploadError: (err: string | null) => void;
  handleUpload: () => void;
  handleClear: () => void;
}

export function UploadArea({ file, setFile, uploadError, setUploadError, handleUpload, handleClear }: UploadAreaProps) {
  return (
    <section className="card upload-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Data Source</h2>
        {file && <button className="btn secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleClear}>Clear Data</button>}
      </div>

      <div className="upload-controls">
        <input
          type="file"
          accept=".csv"
          className="file-input"
          onChange={(e) => { setFile(e.target.files?.[0] || null); setUploadError(null); }}
        />
        <button className="btn primary-btn" onClick={handleUpload}>Upload CSV</button>
      </div>
      {uploadError && <p className="error-text">{uploadError}</p>}
    </section>
  );
}
