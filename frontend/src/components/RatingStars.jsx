import React from 'react';

export default function RatingStars({ value = 0, outOf = 5 }) {
  const rounded = Math.round(Number(value) * 2) / 2;
  return (
    <span aria-label={`${value} out of ${outOf} stars`} style={{ color: 'var(--marigold-deep)', fontWeight: 700 }}>
      {'★'.repeat(Math.floor(rounded))}
      {rounded % 1 !== 0 ? '½' : ''}
      {'☆'.repeat(outOf - Math.ceil(rounded))}
      <span className="text-muted" style={{ fontWeight: 400, marginLeft: 6 }}>{Number(value).toFixed(1)}</span>
    </span>
  );
}
