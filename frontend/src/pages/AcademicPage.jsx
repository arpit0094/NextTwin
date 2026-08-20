import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { predictAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function AcademicPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const run = async () => {
    setLoading(true); setError('');
    try {
      const { data: res } = await predictAPI.academic();
      setData(res);
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed. Please complete your profile first.');
    } finally { setLoading(false); }
  };

  useEffect(() => { run(); }, []);

  // Build a CGPA trend line including prediction
  const trendData = data ? [
    { name: 'Current',   cgpa: data.current_cgpa },
    { name: 'Next Sem',  cgpa: data.predicted_cgpa },
  ] : [];

  const trendColor = !data ? '#6366f1'
    : data.trend === 'improving' ? '#10b981'
    : data.trend === 'declining' ? '#ef4444' : '#f59e0b';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📈 Academic Performance Prediction</h1>
        <p>Gradient Boosting model predicts your future CGPA based on study patterns and skills</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error}{' '}<Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete your profile →</Link>
        </div>
      )}

      {loading && <LoadingSpinner text="Running Gradient Boosting model…" />}

      {data && (
        <div className="fade-in">
          {/* CGPA cards */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="card" style={{ borderColor: '#6366f133', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>CURRENT CGPA</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#6366f1' }}>{data.current_cgpa}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 10.0</div>
            </div>
            <div className="card" style={{ borderColor: `${trendColor}33`, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>PREDICTED NEXT SEM</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: trendColor }}>{data.predicted_cgpa}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 10.0</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>TREND</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: trendColor, textTransform: 'capitalize' }}>
                {data.trend === 'improving' ? '↑' : data.trend === 'declining' ? '↓' : '→'} {data.trend}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {data.change >= 0 ? '+' : ''}{data.change} change
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">CGPA Trend Forecast</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} />
                <YAxis domain={[Math.max(0, data.current_cgpa - 1.5), Math.min(10, data.predicted_cgpa + 0.5)]}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={(v) => [v, 'CGPA']}
                />
                <ReferenceLine y={7.0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '7.0 Target', fill: '#f59e0b', fontSize: 11 }} />
                <Line type="monotone" dataKey="cgpa" stroke={trendColor} strokeWidth={3}
                  dot={{ fill: trendColor, r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* XAI */}
          <div className="card">
            <div className="section-title">🧠 Why this prediction? (Explainable AI)</div>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              Feature importance from the Gradient Boosting model shows which factors influenced your predicted CGPA.
            </div>
            {Object.entries(data.feature_contributions || {}).slice(0, 8).map(([feat, pct]) => (
              <div key={feat} className="xai-bar-row">
                <span className="xai-bar-label">{feat}</span>
                <div className="xai-bar-track">
                  <div className="xai-bar-fill" style={{ width: `${pct}%`, background: 'var(--gradient-main)' }} />
                </div>
                <span className="xai-bar-pct" style={{ color: 'var(--accent-primary)' }}>{pct}%</span>
              </div>
            ))}
            <div className="grid-2" style={{ marginTop: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginBottom: 10 }}>✅ Positive Factors</div>
                {data.positive_factors?.map(f => (
                  <div key={f.feature} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#10b981' }}>+</span> {f.feature} ({f.value}/10 or {f.value})
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 10 }}>⚠️ Needs Improvement</div>
                {data.negative_factors?.map(f => (
                  <div key={f.feature} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#ef4444' }}>−</span> {f.feature} ({f.value}/10 or {f.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={run} disabled={loading}>
        🔄 Re-run Prediction
      </button>
    </div>
  );
}
