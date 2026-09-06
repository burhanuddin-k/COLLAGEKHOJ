import React, { useState } from 'react';
import { portalApi } from '../../api/endpoints';

export default function ClaimCollege() {
  const [collegeId, setCollegeId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const { data } = await portalApi.claim({ collegeId: Number(collegeId), proofDocumentUrl: proofUrl || undefined });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not submit claim.');
    }
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56, maxWidth: 520 }}>
      <h1 style={{ fontSize: '1.7rem' }}>Claim your college profile</h1>
      <p className="text-muted">
        Find your college's ID from its profile URL, then submit proof of ownership (an official
        email domain document, letterhead, or authorization letter). An admin reviews every claim
        before granting edit access.
      </p>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginTop: 16 }}>
        <div className="form-row">
          <label htmlFor="collegeId">College ID</label>
          <input id="collegeId" className="input" required value={collegeId} onChange={(e) => setCollegeId(e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="proofUrl">Proof document URL (optional for now)</label>
          <input id="proofUrl" className="input" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://…" />
        </div>
        {error && <p style={{ color: 'var(--clay)' }}>{error}</p>}
        {message && <p style={{ color: 'var(--verified)' }}>{message}</p>}
        <button type="submit" className="btn btn-primary">Submit claim</button>
      </form>
    </div>
  );
}
