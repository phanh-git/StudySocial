import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');

  // Gọi API khi component mount
  useEffect(() => {
    fetchHello();
  }, []);

  const fetchHello = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/hello');
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setMessage(data.message);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data from backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHelloWithName = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/hello/name?name=${encodeURIComponent(name)}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setMessage(data.message);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data from backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Spring Boot</h1>
        
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <div>
            <h2>{message}</h2>
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '10px', marginRight: '10px' }}
          />
          <button onClick={fetchHelloWithName} style={{ padding: '10px' }}>
            Say Hello
          </button>
        </div>
        
        <button onClick={fetchHello} style={{ marginTop: '20px', padding: '10px' }}>
          Refresh
        </button>
      </header>
    </div>
  );
}

export default App;