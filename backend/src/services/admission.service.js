const { pool } = require('../config/db');

// Derives a human status from dates rather than storing it — a stored
// status would drift out of sync with the actual dates over time.
function computeStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'UNKNOWN';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysToClose = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (now < start) return 'UPCOMING';
  if (now > end) return 'CLOSED';
  if (daysToClose <= 7) return 'CLOSING_SOON';
  return 'OPEN';
}

async function list({ state, course, status, page = 1, limit = 20 }) {
  const where = ['a.is_published = 1', 'c.is_published = 1'];
  const params = [];
  if (state) { where.push('st.name = ?'); params.push(state); }
  if (course) { where.push('(co.slug = ? OR co.name = ?)'); params.push(course, course); }

  const offset = (Math.max(1, page) - 1) * limit;
  const [rows] = await pool.query(
    `SELECT a.id, a.application_start_date, a.application_end_date, a.entrance_exam,
            a.counselling_date, a.classes_start_date, a.official_application_url,
            a.last_verified_at, c.name AS college_name, c.slug AS college_slug,
            co.name AS course_name, st.name AS state
     FROM admissions a
     JOIN college_courses cc ON cc.id = a.college_course_id
     JOIN colleges c ON c.id = cc.college_id
     JOIN courses co ON co.id = cc.course_id
     JOIN states st ON st.id = c.state_id
     WHERE ${where.join(' AND ')}
     ORDER BY a.application_end_date ASC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const withStatus = rows
    .map((r) => ({ ...r, status: computeStatus(r.application_start_date, r.application_end_date) }))
    .filter((r) => !status || r.status === status);

  return withStatus;
}

async function trackDeadline(studentId, admissionId, remindAt) {
  const [result] = await pool.query(
    'INSERT INTO deadlines (student_id, admission_id, remind_at) VALUES (?, ?, ?)',
    [studentId, admissionId, remindAt]
  );
  return { id: result.insertId };
}

module.exports = { list, trackDeadline, computeStatus };
