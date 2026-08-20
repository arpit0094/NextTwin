import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { predictAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function SkillsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const run = async () => {
    setLoading(true); setError('');
    try {
      const { data: res } = await predictAPI.skills();
      setData(res);
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed. Complete your profile first.');
    } finally { setLoading(false); }
  };

  useEffect(() => { run(); }, []);

  // Build chart data
  const chartData = data ? data.improvements.map(item => ({
    name: item.skill.replace('Data Structures & Algorithms', 'DSA').replace('Machine Learning', 'ML').replace('Problem Solving', 'PS').replace('Communication', 'Comm').replace('JavaScript', 'JS'),
    Current: item.current,
    Predicted: item.predicted,
  })) : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🛠️ Skill Development Prediction</h1>
        <p>Linear Regression model predicts skill growth based on your projects, certifications, and activities</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete profile →</Link>
        </div>
      )}
      {loading && <LoadingSpinner text="Running skill growth model…" />}

      {data && (
        <div className="fade-in">
          {/* Summary */}
          <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>📊</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.summary}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Growth factor: <strong style={{ color: 'var(--accent-primary)' }}>{(data.growth_factor * 100).toFixed(1)}%</strong> of potential
                </div>
              </div>
            </div>
          </div>

          {/* Chart: Current vs Predicted */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Current vs Predicted Skills (Next Semester)</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: 13, color: 'var(--text-secondary)' }} />
                <Bar dataKey="Current"   fill="#475569" radius={[4,4,0,0]} />
                <Bar dataKey="Predicted" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill improvement table */}
          <div className="card">
            <div className="section-title">Predicted Improvement per Skill</div>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Current</th>
                  <th>Predicted</th>
                  <th>Improvement</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.improvements.map(item => {
                  const pct = (item.predicted / 10) * 100;
                  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#6366f1';
                  return (
                    <tr key={item.skill}>
                      <td style={{ fontWeight: 500 }}>{item.skill}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.current}/10</td>
                      <td style={{ fontWeight: 600, color }}>{item.predicted}/10</td>
                      <td style={{ color: item.improvement > 0 ? '#10b981' : 'var(--text-muted)' }}>
                        {item.improvement > 0 ? '+' : ''}{item.improvement}
                      </td>
                      <td style={{ width: 140 }}>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={run} disabled={loading}>
        🔄 Re-run Skill Prediction
      </button>
    </div>
  );
}
