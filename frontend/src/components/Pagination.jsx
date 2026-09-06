import React from 'react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  let last = 0;
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
      <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      {pages.map((p) => {
        const showEllipsis = p - last > 1;
        last = p;
        return (
          <React.Fragment key={p}>
            {showEllipsis && <span style={{ padding: '7px 4px', color: 'var(--text-muted)' }}>…</span>}
            <button
              type="button"
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}
      <button type="button" className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
