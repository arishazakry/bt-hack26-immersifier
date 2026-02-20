import { useState, useCallback } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export function useLabAPI(sessionId) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchScenario = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/scenario`);
      const data = await res.json();
      return data;
    } catch (e) {
      setError('Cannot reach server. Is Flask running on port 5001?');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendAction = useCallback(async (stepId, action) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/action`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: sessionId, step_id: stepId, action })
      });
      return await res.json();
    } catch (e) {
      setError('Network error — check your Flask server.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchDebrief = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/debrief`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: sessionId })
      });
      return await res.json();
    } catch (e) {
      setError('Could not load debrief.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { fetchScenario, sendAction, fetchDebrief, loading, error };
}
