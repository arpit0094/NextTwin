import { useEffect, useState } from 'react';
import { careerAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#84cc16'];

export default function CareerPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected,setSelected]= useState(null);
  const [error,   setError]   = useState('');

  useEffect(() => {
    careerAPI.compatibility()
      .then(({ data: res }) => { setData(res); setSelected(res.roles[0]); setLoading(false); })
      .catch(e => { setError(e.response?.data?.detail || 'Please complete your profile first.'); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner text="Calculating career compatibility…" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🚀 Career Compatibility</h1>
        <p>Weighted skill analysis to find your ideal career role</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error} <Link to="/profile" style={{ color: 'var(--accent-orange)' }}>Complete profile →</Link>
        </div>
      )}

      {data && (
        <div className="fade-in">
          {/* Top recommendation */}
          <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent-primary)', display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 48 }}>🏆</span>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>BEST MATCH FOR YOU</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent-primary)' }}>{data.recommended_role}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                {data.roles[0]?.score}% compatibility · {data.roles[0]?.description}
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Bar chart */}
            <div className="card">
              <div className="section-title">Career Compatibility Scores</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.roles} layout="vertical" barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="role" width={130} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={v => [`${v}%`, 'Compatibility']}
                    cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                  />
                  <Bar dataKey="score" radius={[0,6,6,0]}>
                    {data.roles.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Role details */}
            <div className="card">
              <div className="section-title">Role Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {data.roles.map((role, i) => (
                  <div
                    key={role.role}
                    className="career-row"
                    style={{ cursor: 'pointer', background: selected?.role === role.role ? 'rgba(99,102,241,0.08)' : 'transparent', borderRadius: 8, padding: '10px 8px', transition: 'background 0.15s' }}
                    onClick={() => setSelected(role)}
                  >
                    <div className="career-role">{role.role}</div>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${role.score}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                    <div className="career-score" style={{ color: COLORS[i % COLORS.length] }}>{role.score}%</div>
                  </div>
                ))}
              </div>

              {/* Selected role explanation */}
              {selected && (
                <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>{selected.role}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{selected.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Key skills: {selected.key_skills?.join(', ')}
                  </div>
                  {selected.explanation?.map((exp, i) => (
                    <div key={i} style={{ fontSize: 13, padding: '4px 0', color: 'var(--text-secondary)' }}>
                      • {exp}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
