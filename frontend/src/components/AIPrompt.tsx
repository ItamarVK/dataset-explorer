export function AIPrompt({
  question,
  setQuestion,
  askError,
  setAskError,
  handleAsk,
  sqlQuery,
  aiAnswer
}: any) {
  return (
    <section className="card ask-section">
      <h2>Ask Gemini</h2>
      {askError && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{askError}</div>}
      <div className="ask-controls">
        <input
          type="text"
          className="text-input ask-input"
          placeholder="Ask a question about your data..."
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (askError) setAskError(null);
          }}
        />
        <button className="btn primary-btn" onClick={handleAsk}>
          Ask
        </button>
      </div>
      <div className="response-panel">
        {!sqlQuery && !aiAnswer ? (
          <p className="placeholder-text">_ AI responses will appear here...</p>
        ) : (
          <div style={{ textAlign: 'left' }}>
            {sqlQuery && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Generated SQL:</strong>
                <code style={{ background: '#000', padding: '0.5rem', display: 'block', borderRadius: '4px', overflowX: 'auto' }}>{sqlQuery}</code>
              </div>
            )}
            {aiAnswer && (
              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Answer:</strong>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{aiAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
