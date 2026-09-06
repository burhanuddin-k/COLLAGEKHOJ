import React, { useEffect, useState } from 'react';
import { userApi } from '../api/endpoints';

export default function StudentProfile() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    userApi.me().then(({ data }) => setForm({
      fullName: data.data.full_name,
      email: data.data.email,
      preferredCourse: data.data.preferred_course || '',
      preferredState: data.data.preferred_state || '',
      preferredCity: data.data.preferred_city || '',
      budgetMin: data.data.budget_min || '',
      budgetMax: data.data.budget_max || '',
    }));
  }, []);

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    await userApi.updateMe(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!form) return <div className="container" style={{ paddingTop: 40 }}><div className="skeleton" style={{ height: 200 }} /></div>;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56, maxWidth: 520 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Your profile</h1>
      <form onSubmit={handleSave} className="card" style={{ padding: 24, marginTop: 16 }}>
        <div className="form-row">
          <label>Name</label>
          <input className="input" value={form.fullName} disabled />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input className="input" value={form.email} disabled />
        </div>
        <div className="form-row">
          <label htmlFor="preferredCourse">Preferred course</label>
          <input id="preferredCourse" className="input" value={form.preferredCourse} onChange={(e) => update('preferredCourse', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="preferredState">Preferred state</label>
          <input id="preferredState" className="input" value={form.preferredState} onChange={(e) => update('preferredState', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="preferredCity">Preferred city</label>
          <input id="preferredCity" className="input" value={form.preferredCity} onChange={(e) => update('preferredCity', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Annual budget range (₹)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" type="number" placeholder="Min" value={form.budgetMin} onChange={(e) => update('budgetMin', e.target.value)} />
            <input className="input" type="number" placeholder="Max" value={form.budgetMax} onChange={(e) => update('budgetMax', e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Save profile</button>
        {saved && <span className="text-muted" style={{ marginLeft: 12 }}>Saved.</span>}
      </form>
    </div>
  );
}
