import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { predictAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

export default function XAIPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [model,   setModel]   = useState('placement');
  const [error,   setError]   = useState('');

  const fetch = async (m) => {
    setLoading(true); setError('');
    try {
      const fn = m === 'placement' ? predictAPI.placement : predictAPI.academic;
      const { data: res } = await fn();
      setData(res);
    } catch (e) {
      setError(e.response?.data?.detail || 'Please complete your profile first.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(model); }, [model]);

  const barData = data
    ? Object.entries(data.feature_contributions || {}).slice(0, 10).map(([k, v]) => ({ feature: k, importance: v }))
    : [];

  const radarData = data
    ? Object.entries(data.feature_contributions || {}).slice(0, 8).map(([k, v]) => ({ feature: k.split(' ').slice(0,2).join(' '), importance: v }))
    : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🧠 Explainable AI (XAI)</h1>
        <p>Understand exactly why the AI model made each prediction — transparent, not a black box</p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <strong>How XAI works here:</strong> We use <strong>feature_importances_</strong> from scikit-learn's tree-based models
        (Random Forest &amp; Gradient Boosting). This shows which input features the model relied on most when making predictions.
        Higher % = more influential.
      </div>

      {/* Model selector */}
      <div className="tab-nav" style={{ maxWidth: 400, marginBottom: 24 }}>
        <button className={`tab-btn ${model === 'placement' ? 'active' : ''}`} onClick={() => setModel('placement')}>
          🎯 Placement Model
        </button>
        <button className={`tab-btn ${model === 'academic' ? 'active' : ''}`} onClick={() => setModel('academic')}>
          📈 Academic Model
        </button>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete profile →</Link>
        </div>
      )}
      {loading && <LoadingSpinner text="Computing XAI explanations…" />}

      {data && !loading && (
        <div className="fade-in">
          {/* Main score */}
          <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              {model === 'placement' ? 'PLACEMENT READINESS SCORE' : 'PREDICTED CGPA'}
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--accent-primary)' }}>
              {model === 'placement' ? `${data.placement_readiness}%` : data.predicted_cgpa}
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Bar chart */}
            <div className="card">
              <div className="section-title">Feature Importance (Bar Chart)</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0,30]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="feature" width={160} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={v => [`${v}%`, 'Importance']}
                    cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                  />
                  <Bar dataKey="importance" fill="#6366f1" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar chart */}
            <div className="card">
              <div className="section-title">Feature Importance (Radar)</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="feature" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Radar dataKey="importance" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Positive / Negative */}
          <div className="grid-2">
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginBottom: 16 }}>✅ Positive Contributions</div>
              {data.positive_factors?.length ? data.positive_factors.map(f => (
                <div key={f.feature} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>+ {f.feature}</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{f.contribution}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Current value: {f.value}</div>
                </div>
              )) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Improve your profile to see positive factors.</div>}
            </div>
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', marginBottom: 16 }}>⚠️ Limiting Factors</div>
              {data.negative_factors?.length ? data.negative_factors.map(f => (
                <div key={f.feature} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>− {f.feature}</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{f.contribution}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Current value: {f.value} (needs improvement)</div>
                </div>
              )) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No major limiting factors!</div>}
            </div>
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <div className="section-title">📚 About This XAI Method</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p><strong>Method:</strong> sklearn <code>feature_importances_</code> (Gini importance for Random Forest, gain for Gradient Boosting)</p>
              <p><strong>Interpretation:</strong> Each bar shows what percentage of the model's decision was based on that feature.</p>
              <p><strong>Model:</strong> {model === 'placement' ? 'Random Forest Regressor (150 trees, max_depth=8)' : 'Gradient Boosting Regressor (120 estimators, lr=0.1)'}</p>
              <p><strong>Dataset:</strong> Trained on 300 synthetic student records with realistic feature-label relationships.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
