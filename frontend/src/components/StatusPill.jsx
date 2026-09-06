import React from 'react';

const STYLE = {
  OPEN: { bg: 'var(--verified-bg)', color: 'var(--verified)', label: 'Open' },
  UPCOMING: { bg: '#eaf0fb', color: 'var(--indigo)', label: 'Upcoming' },
  CLOSING_SOON: { bg: 'var(--clay-bg)', color: 'var(--clay)', label: 'Closing soon' },
  CLOSED: { bg: 'var(--paper-dim)', color: 'var(--text-muted)', label: 'Closed' },
  UNKNOWN: { bg: 'var(--paper-dim)', color: 'var(--text-muted)', label: 'Dates pending' },
};

export default function StatusPill({ status }) {
  const s = STYLE[status] || STYLE.UNKNOWN;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
  );
}
