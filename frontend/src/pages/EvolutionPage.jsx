import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function EvolutionPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    profileAPI.evolution()
      .then(({ data: res }) => { setData(res); setLoading(false); })
      .catch(e => { setError(e.response?.data?.detail || 'Please complete your profile first.'); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner text="Loading Digital Twin progress timeline…" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📈 Digital Twin Evolution & Timeline</h1>
        <p>Track how your Digital Twin metrics, placement readiness, and CGPA progress over time</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete profile →</Link>
        </div>
      )}

      {data && (
        <div className="fade-in">
          {/* Main timeline chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Placement Readiness & Twin Score Progression</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" name="Placement Readiness (%)" dataKey="readiness" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                <Line type="monotone" name="Twin Score" dataKey="twin_score" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Historical timeline table */}
          <div className="card">
            <div className="section-title">Timeline Snapshots Log</div>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Period / Month</th>
                  <th>CGPA</th>
                  <th>Placement Readiness</th>
                  <th>Digital Twin Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.timeline.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.month}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.cgpa}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{row.readiness}%</td>
                    <td style={{ fontWeight: 600, color: '#6366f1' }}>{row.twin_score}</td>
                    <td>
                      {i > 0 ? (
                        <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                          📈 +{(row.readiness - data.timeline[i-1].readiness).toFixed(1)}% growth
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Baseline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
