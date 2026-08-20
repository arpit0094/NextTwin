import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { predictAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';

function GaugeScore({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const label = pct >= 70 ? 'Placement Ready' : pct >= 50 ? 'Needs Improvement' : 'Significant Work Needed';

  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <ResponsiveContainer width={220} height={140}>
          <PieChart>
            <Pie
              data={[{ value: pct }, { value: 100 - pct }]}
              cx={110} cy={120} startAngle={180} endAngle={0}
              innerRadius={80} outerRadius={108} paddingAngle={2}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="var(--bg-elevated)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color, lineHeight: 1 }}>{pct.toFixed(1)}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Readiness</div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <span style={{
          background: `${color}22`, color, fontWeight: 700, fontSize: 14,
          padding: '6px 18px', borderRadius: 99,
        }}>{label}</span>
      </div>
    </div>
  );
}

export default function PlacementPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const run = async () => {
    setLoading(true); setError('');
    try {
      const { data: res } = await predictAPI.placement();
      setData(res);
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed. Complete your profile first.');
    } finally { setLoading(false); }
  };

  useEffect(() => { run(); }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🎯 Placement Readiness Prediction</h1>
        <p>Random Forest model scores your placement readiness based on 15+ features</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Go to Profile →</Link>
        </div>
      )}
      {loading && <LoadingSpinner text="Running Random Forest model…" />}

      {data && (
        <div className="fade-in">
          {/* Gauge */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Placement Readiness Score</div>
            <GaugeScore score={data.placement_readiness} />
          </div>

          {/* Factors */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginBottom: 16 }}>✅ Positive Factors</div>
              {data.positive_factors?.length ? data.positive_factors.map(f => (
                <div key={f.feature} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>+ {f.feature}</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{f.contribution}</span>
                </div>
              )) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No strong positive factors yet. Improve your skills!</div>}
            </div>
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', marginBottom: 16 }}>⚠️ Negative Factors</div>
              {data.negative_factors?.length ? data.negative_factors.map(f => (
                <div key={f.feature} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>− {f.feature}</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{f.contribution}</span>
                </div>
              )) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No major weaknesses found!</div>}
            </div>
          </div>

          {/* Feature importance */}
          <div className="card">
            <div className="section-title">🧠 Feature Importance (XAI)</div>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              These percentages show how much each feature influenced the Random Forest model's prediction.
            </div>
            {Object.entries(data.feature_contributions || {}).slice(0, 10).map(([feat, pct]) => (
              <div key={feat} className="xai-bar-row">
                <span className="xai-bar-label">{feat}</span>
                <div className="xai-bar-track">
                  <div className="xai-bar-fill" style={{ width: `${pct}%`, background: '#6366f1' }} />
                </div>
                <span className="xai-bar-pct" style={{ color: 'var(--accent-primary)' }}>{pct}%</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <Link to="/whatif" className="btn btn-secondary">
              🔮 Try What-If Simulator to improve this score →
            </Link>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={run} disabled={loading}>
        🔄 Re-run Prediction
      </button>
    </div>
  );
}
