import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { DataGrid } from './components/DataGrid';

describe('Dataset Explorer Frontend', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });
  it('renders the File Upload UI', () => {
    render(<App />);
    expect(screen.getByText(/Upload CSV/i)).toBeInTheDocument();
  });

  it('renders the Filterable / Searchable Table View', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Search \(e\.g\./i)).toBeInTheDocument();
  });

  it('renders the Ask a question input with LLM response panel', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Ask a question about your data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ask/i })).toBeInTheDocument();
  });

  it('shows error when uploading without a file', () => {
    render(<App />);
    const uploadBtn = screen.getByRole('button', { name: /Upload CSV/i });
    fireEvent.click(uploadBtn);
    expect(screen.getByText(/Please select a file first/i)).toBeInTheDocument();
  });

  it('shows error when asking an empty question', () => {
    render(<App />);
    const askBtn = screen.getByRole('button', { name: /Ask/i });
    fireEvent.click(askBtn);
    expect(screen.getByText(/Question cannot be empty/i)).toBeInTheDocument();
  });

  it('calls the backend API when uploading a valid file', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success", rows: 10, columns: ["A"] })
    });

    const { container } = render(<App />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'data.csv', { type: 'text/csv' });
    
    // Simulate user selecting a file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Simulate user clicking upload
    const uploadBtn = screen.getByRole('button', { name: /Upload CSV/i });
    fireEvent.click(uploadBtn);

    // Verify that the fetch API was actually called with the correct endpoint
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/upload',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('fetches rows from backend after a successful upload', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success", rows: 10, columns: ["A"] })
    });
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{"A": "Value1"}], total: 1 })
    });

    const { container } = render(<App />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File([''], 'd.csv', { type: 'text/csv' })] } });
    
    const uploadBtn = screen.getByRole('button', { name: /Upload CSV/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/rows?limit=100&offset=0'
      );
    });
  });

  it('filters the datagrid based on search input', () => {
    const dummyRows = [{ Name: "Alice" }, { Name: "Bob" }];
    const dummyColumns = ["Name"];
    render(<DataGrid rows={dummyRows} columns={dummyColumns} />);
    
    // Check both are in document initially
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    
    // Type in search bar
    const searchInput = screen.getByPlaceholderText(/Search \(e\.g\./i);
    fireEvent.change(searchInput, { target: { value: "Ali" } });
    
    // Check Alice remains, Bob is gone
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it('filters the datagrid using structured queries', () => {
    const dummyRows = [{ id: 1, salary: 90000 }, { id: 2, salary: 60000 }, { id: 17, salary: 30000 }];
    const dummyColumns = ["id", "salary"];
    render(<DataGrid rows={dummyRows} columns={dummyColumns} />);
    
    const searchInput = screen.getByPlaceholderText(/Search \(e\.g\./i);
    
    // Test > operator
    fireEvent.change(searchInput, { target: { value: "salary > 80000" } });
    expect(screen.getByText("90000")).toBeInTheDocument();
    expect(screen.queryByText("60000")).not.toBeInTheDocument();
    
    // Test : operator
    fireEvent.change(searchInput, { target: { value: "id: 17" } });
    expect(screen.getByText("30000")).toBeInTheDocument();
    expect(screen.queryByText("90000")).not.toBeInTheDocument();
  });

  it('calls the backend API when asking a question', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sql_query: "SELECT *", answer: "The AI answer" })
    });

    const { container } = render(<App />);
    const askInput = container.querySelector('.ask-input') as HTMLInputElement;
    fireEvent.change(askInput, { target: { value: "What is the average age?" } });
    
    const askBtn = screen.getByRole('button', { name: /Ask/i });
    fireEvent.click(askBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/ask',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ question: "What is the average age?" })
        })
      );
    });
  });
});
