import { useEffect, useState } from 'react';
import './CacheAdmin.css';

interface CacheStats {
  totalEntries: number;
  byCharacter: Record<string, number>;
  byEmotion: Record<string, number>;
  oldestEntry: string | null;
  newestEntry: string | null;
}

export function CacheAdmin() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCacheStats();
  }, []);

  const fetchCacheStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cache-stats', {
        headers: { 'X-Admin-Token': getAdminToken() },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearOldEntries = async (daysOld: number) => {
    if (!confirm(`Delete cache entries older than ${daysOld} days?`)) return;

    try {
      const response = await fetch('/api/admin/cache-clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': getAdminToken(),
        },
        body: JSON.stringify({ daysOld }),
      });

      if (!response.ok) throw new Error('Failed to clear cache');

      const result = await response.json();
      alert(`Deleted ${result.deletedCount} entries`);
      fetchCacheStats();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const clearByEmotion = async (emotion: string) => {
    if (!confirm(`Delete all ${emotion} emotion cache entries?`)) return;

    try {
      const response = await fetch('/api/admin/cache-by-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': getAdminToken(),
        },
        body: JSON.stringify({ emotion }),
      });

      if (!response.ok) throw new Error('Failed to clear emotion cache');

      const result = await response.json();
      alert(`Deleted ${result.deletedCount} entries`);
      fetchCacheStats();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!isAdminAuthorized()) {
    return (
      <div className="admin-unauthorized">
        <p>⛔ Unauthorized access</p>
      </div>
    );
  }

  return (
    <div className="admin-cache">
      <div className="admin-header">
        <h1>🗂️ Chirpy Voice Cache Admin</h1>
        <button onClick={() => fetchCacheStats()} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="admin-error">Error: {error}</div>}

      {loading ? (
        <div className="admin-loading">Loading cache stats...</div>
      ) : stats ? (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-value">{stats.totalEntries}</div>
              <div className="admin-stat-label">Total Cached Files</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-value">{Object.keys(stats.byCharacter).length}</div>
              <div className="admin-stat-label">Characters</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-value">{Object.keys(stats.byEmotion).length}</div>
              <div className="admin-stat-label">Emotions Used</div>
            </div>
          </div>

          <div className="admin-section">
            <h2>Breakdown by Character</h2>
            <div className="admin-breakdown">
              {Object.entries(stats.byCharacter).map(([char, count]) => (
                <div key={char} className="admin-breakdown-item">
                  <span>{char}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>Breakdown by Emotion</h2>
            <div className="admin-breakdown">
              {Object.entries(stats.byEmotion).map(([emotion, count]) => (
                <div key={emotion} className="admin-breakdown-item">
                  <div>
                    <span>{emotion}</span>
                    <span>{count}</span>
                  </div>
                  <button
                    className="admin-delete-btn"
                    onClick={() => clearByEmotion(emotion)}
                    title={`Delete all ${emotion} entries`}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>Cache Management</h2>
            <div className="admin-actions">
              <button onClick={() => clearOldEntries(7)} className="admin-action-btn">
                Clear entries older than 7 days
              </button>
              <button onClick={() => clearOldEntries(30)} className="admin-action-btn">
                Clear entries older than 30 days
              </button>
              <button onClick={() => clearOldEntries(90)} className="admin-action-btn">
                Clear entries older than 90 days
              </button>
            </div>
          </div>

          {stats.oldestEntry && (
            <div className="admin-info">
              <div>Oldest entry: {new Date(stats.oldestEntry).toLocaleDateString()}</div>
              <div>Newest entry: {new Date(stats.newestEntry || '').toLocaleDateString()}</div>
            </div>
          )}
        </>
      ) : (
        <div>No cache data available</div>
      )}
    </div>
  );
}

function getAdminToken(): string {
  // Get token from URL param or localStorage
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') || localStorage.getItem('admin_token') || '';
}

function isAdminAuthorized(): boolean {
  const token = getAdminToken();
  // Check against environment variable (set in Firebase config)
  const envToken = import.meta.env.REACT_APP_ADMIN_TOKEN;
  return token === envToken && !!envToken;
}
