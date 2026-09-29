import { useEffect, useState } from 'react';
import './CacheAdmin.css';

interface CacheStats {
  totalEntries: number;
  byCharacter: Record<string, number>;
  byEmotion: Record<string, number>;
  oldestEntry: string | null;
  newestEntry: string | null;
}

interface CacheMiss {
  id: string;
  text: string;
  character: string;
  emotion: string;
  reason: string;
  count: number;
  lastAt: string;
}

interface CacheEntry {
  id: string;
  text: string;
  voice: string;
  character: string;
  emotion: string;
  createdAt: string;
}

export function CacheAdmin() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(getAdminToken());
  const [draft, setDraft] = useState('');
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [misses, setMisses] = useState<CacheMiss[]>([]);

  useEffect(() => {
    if (token) fetchCacheStats();
  }, [token]);

  const fetchCacheStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cache-stats', {
        headers: { 'X-Admin-Token': getAdminToken() },
      });

      if (response.status === 401) {
        try { localStorage.removeItem('admin_token'); } catch { /* ignore */ }
        setToken('');
        throw new Error('That token was not accepted.');
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
      setEntries(data.entries || []);
      setMisses(data.misses || []);
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

  const reRecord = async (entry: CacheEntry) => {
    if (!confirm(`Delete the stored take of "${entry.text}"? It gets recorded again the next time it plays.`)) return;
    try {
      const response = await fetch('/api/admin/cache-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
        body: JSON.stringify({ id: entry.id }),
      });
      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
      setEntries((list) => list.filter((e) => e.id !== entry.id));
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!token) {
    return (
      <div className="admin-cache">
        <form
          className="admin-section"
          onSubmit={(e) => {
            e.preventDefault();
            const t = draft.trim();
            if (!t) return;
            try { localStorage.setItem('admin_token', t); } catch { /* ignore */ }
            setToken(t);
          }}
        >
          <h2>Admin token</h2>
          {error && <div className="admin-error">{error}</div>}
          <input type="password" value={draft} onChange={(e) => setDraft(e.target.value)} style={{ width: '100%', padding: 10 }} />
          <button type="submit" className="admin-action-btn">Open</button>
        </form>
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

          <div className="admin-section">
            <h2>Failed, not cached ({misses.length})</h2>
            {misses.length === 0 ? (
              <div style={{ color: '#666' }}>No failures recorded since this logging was added.</div>
            ) : (
              <div className="admin-breakdown">
                {misses.filter((m) => matches(filter, `${m.text} ${m.character} ${m.emotion} ${m.reason}`)).map((m) => (
                  <div key={m.id} className="admin-breakdown-item" style={{ display: 'block', borderLeftColor: '#ff6b6b' }}>
                    <div>{m.text}</div>
                    <div style={{ fontSize: 12, color: '#c62828', marginTop: 4 }}>{m.reason}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      {m.character} · {m.emotion} · failed {m.count}× · last {m.lastAt ? new Date(m.lastAt).toLocaleString() : '?'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-section">
            <h2>Cached lines ({entries.length})</h2>
            <input
              type="search"
              placeholder="Search text, speaker or emotion"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 12 }}
            />
            {groupByDay(entries.filter((e) => matches(filter, `${e.text} ${e.character} ${e.emotion}`))).map(([day, list]) => (
              <details key={day} open={day === groupByDay(entries)[0]?.[0]} style={{ marginBottom: 10 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{day} ({list.length})</summary>
                <div className="admin-breakdown" style={{ marginTop: 8 }}>
                  {list.map((e) => (
                    <div key={e.id} className="admin-breakdown-item">
                      <div style={{ display: 'block' }}>
                        <div>{e.text || <em>(no text saved)</em>}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                          {e.character} · {e.emotion} · {e.voice} · {new Date(e.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <button className="admin-delete-btn" onClick={() => reRecord(e)} title="Delete this take so it is recorded again">
                        Re-record
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            ))}
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

function matches(filter: string, haystack: string): boolean {
  const q = filter.trim().toLowerCase();
  return !q || haystack.toLowerCase().includes(q);
}

function groupByDay(list: CacheEntry[]): [string, CacheEntry[]][] {
  const days = new Map<string, CacheEntry[]>();
  for (const e of list) {
    const day = new Date(e.createdAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    if (!days.has(day)) days.set(day, []);
    days.get(day)!.push(e);
  }
  return [...days.entries()];
}

function getAdminToken(): string {
  const fromUrl = new URLSearchParams(window.location.search).get('admin');
  if (fromUrl && fromUrl !== '1') return fromUrl;
  try { return localStorage.getItem('admin_token') || ''; } catch { return ''; }
}
