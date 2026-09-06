import React, { useState } from 'react';
import { portalApi } from '../../api/endpoints';

const ENTITY_FIELDS = {
  college: ['description', 'website', 'contactEmail', 'contactPhone'],
  college_course: ['courseId', 'seats', 'entranceExam', 'eligibilityNote'],
  fee: ['collegeCourseId', 'tuitionFee', 'admissionFee', 'examFee', 'hostelFee', 'otherCharges', 'sourceUrl'],
  admission: ['collegeCourseId', 'applicationStartDate', 'applicationEndDate', 'entranceExam', 'counsellingDate', 'classesStartDate', 'officialApplicationUrl'],
  facility: ['facilityCode', 'available', 'notes'],
  gallery: ['imageUrl', 'caption'],
};

export default function SubmitUpdate() {
  const [collegeId, setCollegeId] = useState('');
  const [entityType, setEntityType] = useState('college');
  const [entityId, setEntityId] = useState('');
  const [fields, setFields] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  function updateField(key, value) { setFields((f) => ({ ...f, [key]: value })); }

  function handleTypeChange(type) {
    setEntityType(type);
    setFields({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const { data } = await portalApi.submitUpdate({
        collegeId: Number(collegeId),
        entityType,
        entityId: entityId ? Number(entityId) : undefined,
        payload: fields,
      });
      setMessage(data.message);
      setFields({});
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not submit update.');
    }
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56, maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.7rem' }}>Submit an update</h1>
      <p className="text-muted">Nothing you submit here becomes public immediately — it enters an admin review queue first.</p>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginTop: 16 }}>
        <div className="form-row">
          <label htmlFor="collegeId">Your college ID</label>
          <input id="collegeId" className="input" required value={collegeId} onChange={(e) => setCollegeId(e.target.value)} />
        </div>

        <div className="form-row">
          <label htmlFor="entityType">What are you updating?</label>
          <select id="entityType" className="input" value={entityType} onChange={(e) => handleTypeChange(e.target.value)}>
            <option value="college">College information</option>
            <option value="college_course">Course</option>
            <option value="fee">Fees</option>
            <option value="admission">Admission dates</option>
            <option value="facility">Facility</option>
            <option value="gallery">Gallery image</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="entityId">Existing record ID (leave blank if adding new)</label>
          <input id="entityId" className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
        </div>

        {ENTITY_FIELDS[entityType].map((key) => (
          <div className="form-row" key={key}>
            <label htmlFor={key} style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</label>
            <input id={key} className="input" value={fields[key] || ''} onChange={(e) => updateField(key, e.target.value)} />
          </div>
        ))}

        {error && <p style={{ color: 'var(--clay)' }}>{error}</p>}
        {message && <p style={{ color: 'var(--verified)' }}>{message}</p>}
        <button type="submit" className="btn btn-primary">Submit for review</button>
      </form>
    </div>
  );
}
