import { useState } from 'react';
import { whatifAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const SLIDERS = [
  { key: 'dsa',             label: 'DSA',             max: 10 },
  { key: 'python_skill',    label: 'Python',          max: 10 },
  { key: 'java',            label: 'Java',            max: 10 },
  { key: 'javascript',      label: 'JavaScript',      max: 10 },
  { key: 'sql',             label: 'SQL',             max: 10 },
  { key: 'machine_learning',label: 'Machine Learning',max: 10 },
  { key: 'communication',   label: 'Communication',   max: 10 },
  { key: 'problem_solving', label: 'Problem Solving', max: 10 },
  { key: 'aptitude',        label: 'Aptitude',        max: 10 },
  { key: 'projects_count',  label: 'Projects',        max: 20 },
  { key: 'certifications_count', label: 'Certifications', max: 15 },
  { key: 'internship_months',    label: 'Internship (months)', max: 24 },
];

export default function WhatIfPage() {
  const [changes,   setChanges]   = useState({});
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [scenarioName, setScenarioName] = useState('My Scenario');

  const setChange = (key, val) => setChanges(p => ({ ...p, [key]: val }));

  const run = async () => {
    if (Object.keys(changes).length === 0) {
      setError('Please adjust at least one slider before simulating.'); return;
    }
    setLoading(true); setError('');
    try {
      const { data } = await whatifAPI.simulate({ ...changes, scenario_name: scenarioName });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Simulation failed. Complete your profile first.');
    } finally { setLoading(false); }
  };

  const reset = () => { setChanges({}); setResult(null); };

  const compData = result ? [
    { name: 'Placement (%)', Current: result.current.placement_readiness, Scenario: result.scenario.placement_readiness },
    { name: 'Predicted CGPA', Current: result.current.predicted_cgpa, Scenario: result.scenario.predicted_cgpa },
  ] : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔮 What-If Simulator</h1>
        <p>Simulate hypothetical improvements and instantly see how they affect your AI predictions</p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        ℹ️ Changing values here does <strong>NOT</strong> modify your actual profile. This is a safe simulation environment.
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Left: sliders */}
        <div className="whatif-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="whatif-col-title" style={{ color: '#8b5cf6' }}>🔧 SCENARIO CHANGES</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Scenario Name</label>
            <input className="form-input" value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="My Scenario" />
          </div>
          {SLIDERS.map(s => (
            <div key={s.key} className="slider-row">
              <div className="slider-row-header">
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                <span className="slider-value">
                  {changes[s.key] !== undefined ? changes[s.key] : '—'}
                </span>
              </div>
              <input
                type="range" min={0} max={s.max} step={s.max > 10 ? 1 : 0.5}
                value={changes[s.key] !== undefined ? changes[s.key] : 0}
                onChange={e => setChange(s.key, parseFloat(e.target.value))}
              />
            </div>
          ))}
          <button className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={run} disabled={loading}>
            {loading ? '⏳ Simulating…' : '▶ Run Simulation'}
          </button>
        </div>

        {/* Right: results */}
        <div className="whatif-col">
          <div className="whatif-col-title" style={{ color: 'var(--accent-cyan)' }}>📊 SIMULATION RESULTS</div>
          {!result && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔮</div>
              <div style={{ fontSize: 14 }}>Adjust sliders and run the simulation to see results here.</div>
            </div>
          )}
          {loading && <LoadingSpinner text="Running ML simulation…" />}
          {result && (
            <div className="fade-in">
              {/* Comparison cards */}
              <table className="compare-table" style={{ marginBottom: 20 }}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th style={{ color: '#475569' }}>Current</th>
                    <th style={{ color: 'var(--accent-primary)' }}>Scenario</th>
                    <th style={{ color: '#10b981' }}>Δ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Placement Readiness</td>
                    <td style={{ fontWeight: 600 }}>{result.current.placement_readiness}%</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{result.scenario.placement_readiness}%</td>
                    <td style={{ fontWeight: 700, color: result.improvement.placement_readiness >= 0 ? '#10b981' : '#ef4444' }}>
                      {result.improvement.placement_readiness >= 0 ? '+' : ''}{result.improvement.placement_readiness}%
                    </td>
                  </tr>
                  <tr>
                    <td>Predicted CGPA</td>
                    <td style={{ fontWeight: 600 }}>{result.current.predicted_cgpa}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{result.scenario.predicted_cgpa}</td>
                    <td style={{ fontWeight: 700, color: result.improvement.predicted_cgpa >= 0 ? '#10b981' : '#ef4444' }}>
                      {result.improvement.predicted_cgpa >= 0 ? '+' : ''}{result.improvement.predicted_cgpa}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Big improvement number */}
              {result.improvement.placement_readiness_pct !== 0 && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(99,102,241,0.1)', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: result.improvement.placement_readiness_pct >= 0 ? '#10b981' : '#ef4444' }}>
                    {result.improvement.placement_readiness_pct >= 0 ? '📈 +' : '📉 '}{result.improvement.placement_readiness_pct}%
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>relative change in placement readiness</div>
                </div>
              )}

              {/* Changed features */}
              {result.changed_features?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Changes Applied:</div>
                  {result.changed_features.map(f => (
                    <div key={f.feature} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>
                      • {f.feature}: {f.from} → <strong style={{ color: 'var(--accent-primary)' }}>{f.to}</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Comparison bar chart */}
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={compData} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Current"  fill="#475569" radius={[4,4,0,0]} />
                  <Bar dataKey="Scenario" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
