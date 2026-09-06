import React from 'react';

const LABELS = {
  verified: 'Verified',
  needs_verification: 'Needs verification',
  reported: 'Reported',
  outdated: 'Outdated',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function VerifiedBadge({ status, lastVerifiedAt, isDemo }) {
  if (isDemo) {
    return <span className="badge badge-demo">Demo data — not verified</span>;
  }

  const cls = status === 'verified' ? 'badge-verified'
    : status === 'reported' ? 'badge-reported'
      : status === 'outdated' ? 'badge-reported'
        : 'badge-needs-verification';

  return (
    <span className={`badge ${cls}`} title={lastVerifiedAt ? `Last verified on ${formatDate(lastVerifiedAt)}` : 'Not yet verified'}>
      {LABELS[status] || 'Needs verification'}
      {status === 'verified' && lastVerifiedAt ? ` · ${formatDate(lastVerifiedAt)}` : ''}
    </span>
  );
}
