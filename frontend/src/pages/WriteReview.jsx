import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { reviewApi } from '../api/endpoints';

const RATING_FIELDS = [
  ['ratingAcademics', 'Academics'],
  ['ratingFaculty', 'Faculty'],
  ['ratingCampus', 'Campus'],
  ['ratingInfrastructure', 'Infrastructure'],
  ['ratingAdministration', 'Administration'],
  ['ratingValue', 'Value for money'],
];

export default function WriteReview() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const collegeId = Number(params.get('collegeId'));
  const [form, setForm] = useState({
    title: '', description: '', academicYear: '',
    ratingAcademics: 3, ratingFaculty: 3, ratingCampus: 3,
    ratingInfrastructure: 3, ratingAdministration: 3, ratingValue: 3,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await reviewApi.create({ collegeId, ...form });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not submit your review.');
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="container empty-state" style={{ paddingTop: 56 }}>
        <h2>Thanks for sharing your experience</h2>
        <p className="text-muted">Your review is pending moderation and will appear once approved.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>Back to college</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56, maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.6rem' }}>Write a review</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="title">Title</label>
          <input id="title" className="input" required value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="academicYear">Academic year</label>
          <input id="academicYear" className="input" placeholder="e.g. 2023-2024" value={form.academicYear} onChange={(e) => update('academicYear', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="description">Your experience</label>
          <textarea id="description" className="input" rows={6} required minLength={20} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>

        <div className="form-row">
          <label>Ratings</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {RATING_FIELDS.map(([key, label]) => (
              <div key={key}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{label}</span>
                <input type="range" min={1} max={5} value={form[key]} onChange={(e) => update(key, Number(e.target.value))} style={{ width: '100%' }} />
                <span style={{ fontSize: '0.85rem' }}>{form[key]} / 5</span>
              </div>
            ))}
          </div>
        </div>

        {error && <p style={{ color: 'var(--clay)' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit review'}</button>
      </form>
    </div>
  );
}
