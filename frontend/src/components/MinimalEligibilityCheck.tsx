/**
 * MINIMAL ELIGIBILITY CHECK COMPONENT
 * 
 * Simplified version without complex UI
 * Perfect for quick implementation or learning
 * 
 * Features:
 * - Simple form
 * - Basic loading/error/results display
 * - ~100 lines of code
 * - No complex styling
 */

import { useState } from 'react';
import axiosClient from '../lib/axiosClient';
import { extractErrorMessage } from '../lib/errorHandler';

interface Scheme {
  id: number;
  name: string;
  eligible: boolean;
  [key: string]: any;
}

interface Response {
  user: Record<string, any>;
  recommended_schemes: Scheme[];
  total_schemes: number;
  total_eligible: number;
}

export const MinimalEligibilityCheck = () => {
  const [age, setAge] = useState(30);
  const [income, setIncome] = useState(500000);
  const [gender, setGender] = useState('M');
  const [category, setCategory] = useState('General');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Response | null>(null);

  // Check eligibility on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // JWT token automatically added by request interceptor
      const response = await axiosClient.post<Response>('/ml/recommend', {
        age,
        income,
        gender,
        category,
      });

      setResults(response.data);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Check Your Eligibility</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label>Age: </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              disabled={loading}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Annual Income (₹): </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              disabled={loading}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Gender: </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Category: </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="General">General</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </form>

        {/* RESULTS */}
        <div>
          {/* Loading */}
          {loading && <p>Loading...</p>}

          {/* Error */}
          {error && <p style={{ color: 'red' }}>❌ {error}</p>}

          {/* No schemes */}
          {results && results.total_eligible === 0 && (
            <p style={{ color: '#ff9800' }}>ℹ️ No schemes found matching your profile</p>
          )}

          {/* Schemes found */}
          {results && results.total_eligible > 0 && (
            <div>
              <h3>✅ You are eligible for {results.total_eligible} scheme(s):</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {results.recommended_schemes
                  .filter((s) => s.eligible)
                  .map((scheme) => (
                    <li
                      key={scheme.id}
                      style={{
                        background: '#d4edda',
                        border: '1px solid #c3e6cb',
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '4px',
                      }}
                    >
                      <strong>{scheme.name}</strong> (ID: {scheme.id})
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        💡 Your JWT token is automatically attached to the /ml/recommend request from localStorage.
        If it expires, you'll be logged out automatically.
      </p>
    </div>
  );
};

export default MinimalEligibilityCheck;
