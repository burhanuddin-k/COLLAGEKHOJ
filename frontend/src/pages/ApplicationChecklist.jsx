import React, { useEffect, useState } from 'react';
import { userApi } from '../api/endpoints';

export default function ApplicationChecklist() {
  const [rows, setRows] = useState(null);
  const [item, setItem] = useState('');
  const [dueDate, setDueDate] = useState('');

  function load() {
    userApi.checklist().then(({ data }) => setRows(data.data));
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!item.trim()) return;
    await userApi.addChecklistItem({ item, dueDate: dueDate || undefined });
    setItem(''); setDueDate('');
    load();
  }

  async function handleToggle(id, isDone) {
    await userApi.toggleChecklistItem(id, !isDone);
    load();
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56, maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Application checklist</h1>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, margin: '20px 0' }}>
        <input className="input" placeholder="e.g. Upload transcripts" value={item} onChange={(e) => setItem(e.target.value)} />
        <input className="input" type="date" style={{ width: 160 }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>

      {!rows && <div className="skeleton" style={{ height: 160 }} />}
      {rows && rows.length === 0 && <div className="empty-state">Your checklist is empty. Add your first item above.</div>}

      {rows && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((r) => (
            <label key={r.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!r.is_done} onChange={() => handleToggle(r.id, r.is_done)} />
              <span style={{ flex: 1, textDecoration: r.is_done ? 'line-through' : 'none', color: r.is_done ? 'var(--text-muted)' : 'var(--text)' }}>
                {r.item} {r.college_name ? `· ${r.college_name}` : ''}
              </span>
              {r.due_date && <span className="text-muted" style={{ fontSize: '0.82rem' }}>{r.due_date}</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
