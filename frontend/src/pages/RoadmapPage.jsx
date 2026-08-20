import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recsAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function RoadmapPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    recsAPI.roadmap()
      .then(({ data: res }) => { setData(res); setLoading(false); })
      .catch(e => { setError(e.response?.data?.detail || 'Please complete your profile first.'); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner text="Building your 30/60/90-day roadmap…" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🗺️ Personalized 30/60/90-Day Roadmap</h1>
        <p>A structured timeline generated from your Digital Twin gaps to maximize your placement readiness</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete profile →</Link>
        </div>
      )}

      {data && (
        <div className="fade-in">
          {/* Progression chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Projected Readiness Growth Curve</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.progression}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={v => [`${v}%`, 'Placement Readiness']}
                />
                <Line type="monotone" dataKey="readiness" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 30-60-90 Day Cards */}
          <div className="grid-3">
            {data.roadmap.map((phase, idx) => (
              <div key={phase.phase} className="card" style={{ borderTop: `4px solid ${['#6366f1', '#06b6d4', '#10b981'][idx]}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ['#6366f1', '#06b6d4', '#10b981'][idx], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  PHASE {idx + 1}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{phase.phase}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{phase.focus}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {phase.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span style={{ color: ['#6366f1', '#06b6d4', '#10b981'][idx], fontWeight: 700 }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target Readiness:</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: ['#6366f1', '#06b6d4', '#10b981'][idx] }}>
                    {data.progression[idx + 1]?.readiness}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
