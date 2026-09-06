import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collegeApi } from '../api/endpoints';
import CollegeCard from '../components/CollegeCard.jsx';

const STEPS = [
  { key: 'course', label: 'What course do you want?', type: 'text', placeholder: 'e.g. BBA, B.Tech, MBA' },
  { key: 'city', label: 'Which city do you prefer?', type: 'text', placeholder: 'e.g. Pune' },
  { key: 'state', label: 'Which state do you prefer?', type: 'text', placeholder: 'e.g. Maharashtra' },
  { key: 'budget', label: 'What is your annual budget (₹)?', type: 'number', placeholder: 'e.g. 200000' },
  { key: 'collegeType', label: 'Government or private?', type: 'select', options: ['', 'government', 'private', 'autonomous', 'university'] },
  { key: 'hostel', label: 'Do you need a hostel?', type: 'select', options: ['', 'true'], labels: { '': 'No preference', true: 'Yes' } },
];

export default function FindMyCollege() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function setAnswer(value) {
    setAnswers((a) => ({ ...a, [current.key]: value }));
  }

  async function handleNext() {
    if (!isLast) { setStep((s) => s + 1); return; }
    setLoading(true);
    try {
      const { data } = await collegeApi.search({
        course: answers.course || undefined,
        city: answers.city || undefined,
        state: answers.state || undefined,
        maxFee: answers.budget || undefined,
        collegeType: answers.collegeType || undefined,
        hostel: answers.hostel || undefined,
        limit: 12,
      });
      setResults(data.data);
    } finally {
      setLoading(false);
    }
  }

  function reasonsFor(college) {
    const reasons = [];
    if (answers.budget && college.min_fee && Number(college.min_fee) <= Number(answers.budget)) {
      reasons.push('Fits your budget');
    }
    if (answers.city && college.city?.toLowerCase() === answers.city.toLowerCase()) {
      reasons.push('Located in your preferred city');
    }
    if (answers.state && college.state?.toLowerCase() === answers.state.toLowerCase()) {
      reasons.push('Located in your preferred state');
    }
    if (answers.collegeType && college.college_type === answers.collegeType) {
      reasons.push('Matches your college-type preference');
    }
    if (answers.course) {
      reasons.push('Offers your preferred course');
    }
    return reasons;
  }

  if (results !== null) {
    return (
      <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <h1 style={{ fontSize: '1.8rem' }}>Colleges that match you</h1>
        <p className="text-muted">
          These aren't ranked by a hidden score — each card explains exactly why it matched your answers.
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setResults(null); setStep(0); setAnswers({}); }}>
          Start over
        </button>

        {results.length === 0 && (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <h3>No exact matches yet</h3>
            <p className="text-muted">Try widening your budget or clearing a preference, or browse all colleges.</p>
            <Link to="/search" className="btn btn-primary">Browse all colleges</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          {results.map((college) => (
            <div key={college.id}>
              <CollegeCard college={college} />
              <div className="card" style={{ padding: '12px 20px', marginTop: -1, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                <strong style={{ fontSize: '0.85rem' }}>Why this college matches you</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  {reasonsFor(college).map((r) => <li key={r} style={{ color: 'var(--verified)' }}>✓ {r}</li>)}
                  {reasonsFor(college).length === 0 && <li className="text-muted">Matched your search broadly</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 56, maxWidth: 640, margin: '0 auto' }}>
      <p className="text-muted">Question {step + 1} of {STEPS.length}</p>
      <h1 style={{ fontSize: '1.6rem' }}>{current.label}</h1>

      {current.type === 'text' && (
        <input className="input" placeholder={current.placeholder} value={answers[current.key] || ''} onChange={(e) => setAnswer(e.target.value)} style={{ marginTop: 16 }} />
      )}
      {current.type === 'number' && (
        <input className="input" type="number" placeholder={current.placeholder} value={answers[current.key] || ''} onChange={(e) => setAnswer(e.target.value)} style={{ marginTop: 16 }} />
      )}
      {current.type === 'select' && (
        <select className="input" value={answers[current.key] || ''} onChange={(e) => setAnswer(e.target.value)} style={{ marginTop: 16 }}>
          {current.options.map((o) => (
            <option key={o || 'any'} value={o}>{current.labels?.[o] ?? (o || 'No preference')}</option>
          ))}
        </select>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</button>
        <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
          {loading ? 'Finding matches…' : isLast ? 'See my matches' : 'Next'}
        </button>
      </div>
    </div>
  );
}
