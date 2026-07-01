import { useState } from 'react';

export function DataGrid({ rows = [], columns = [] }: { rows?: any[], columns?: string[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = rows.filter(row => {
    if (!searchTerm.trim()) return true;
    
    const match = searchTerm.match(/^([a-zA-Z0-9_]+)\s*([><=:])\s*(.+)$/);
    if (match) {
      const [_, col, op, val] = match;
      const rowKey = Object.keys(row).find(k => k.toLowerCase() === col.toLowerCase());
      
      if (rowKey) {
        const rowVal = row[rowKey];
        if (op === '>' || op === '<') {
          const numRowVal = Number(rowVal);
          const numVal = Number(val);
          if (!isNaN(numRowVal) && !isNaN(numVal)) {
            return op === '>' ? numRowVal > numVal : numRowVal < numVal;
          }
        } else if (op === ':' || op === '=') {
          return String(rowVal).toLowerCase().includes(val.toLowerCase());
        }
      }
    }

    const lowerSearch = searchTerm.toLowerCase();
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <section className="card table-section">
      <h2>Dataset Viewer</h2>
      <div className="table-controls" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search (e.g. 'John' or 'salary > 30000')"
          className="text-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.length === 0 ? (
                <>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                </>
              ) : (
                columns.map((col, idx) => <th key={idx}>{col}</th>)
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 3} className="empty-state">
                  {rows.length === 0 
                    ? "No data available. Upload a CSV file here to begin exploring." 
                    : "No matches found."}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, cidx) => (
                    <td key={cidx}>{row[col]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
