const { pool } = require('../config/db');
const { ApiError } = require('../utils/apiError');

async function getStudentId(userId) {
  const [rows] = await pool.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  if (rows.length === 0) throw ApiError.forbidden('This action is only available to student accounts');
  return rows[0].id;
}

async function listSaved(userId) {
  const studentId = await getStudentId(userId);
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.logo_url, ci.name AS city, st.name AS state, sc.created_at AS saved_at
     FROM saved_colleges sc
     JOIN colleges c ON c.id = sc.college_id
     JOIN cities ci ON ci.id = c.city_id
     JOIN states st ON st.id = c.state_id
     WHERE sc.student_id = ? ORDER BY sc.created_at DESC`,
    [studentId]
  );
  return rows;
}

async function saveCollege(userId, collegeId) {
  const studentId = await getStudentId(userId);
  await pool.query(
    'INSERT IGNORE INTO saved_colleges (student_id, college_id) VALUES (?, ?)',
    [studentId, collegeId]
  );
  return { saved: true };
}

async function unsaveCollege(userId, collegeId) {
  const studentId = await getStudentId(userId);
  await pool.query('DELETE FROM saved_colleges WHERE student_id = ? AND college_id = ?', [studentId, collegeId]);
  return { saved: false };
}

async function listChecklist(userId) {
  const studentId = await getStudentId(userId);
  const [rows] = await pool.query(
    `SELECT ac.id, ac.item, ac.is_done, ac.due_date, c.name AS college_name
     FROM application_checklists ac
     LEFT JOIN colleges c ON c.id = ac.college_id
     WHERE ac.student_id = ? ORDER BY ac.due_date IS NULL, ac.due_date ASC`,
    [studentId]
  );
  return rows;
}

async function addChecklistItem(userId, { item, collegeId, dueDate }) {
  const studentId = await getStudentId(userId);
  const [result] = await pool.query(
    'INSERT INTO application_checklists (student_id, college_id, item, due_date) VALUES (?, ?, ?, ?)',
    [studentId, collegeId || null, item, dueDate || null]
  );
  return { id: result.insertId };
}

async function toggleChecklistItem(userId, itemId, isDone) {
  const studentId = await getStudentId(userId);
  const [result] = await pool.query(
    'UPDATE application_checklists SET is_done = ? WHERE id = ? AND student_id = ?',
    [isDone ? 1 : 0, itemId, studentId]
  );
  if (result.affectedRows === 0) throw ApiError.notFound('Checklist item not found');
  return { updated: true };
}

async function updateProfile(userId, { preferredCourse, preferredState, preferredCity, budgetMin, budgetMax }) {
  await getStudentId(userId);
  await pool.query(
    `UPDATE students SET preferred_course = ?, preferred_state = ?, preferred_city = ?,
       budget_min = ?, budget_max = ? WHERE user_id = ?`,
    [preferredCourse || null, preferredState || null, preferredCity || null, budgetMin || null, budgetMax || null, userId]
  );
  return { updated: true };
}

async function dashboard(userId) {
  const studentId = await getStudentId(userId);
  const [[savedCount]] = await pool.query('SELECT COUNT(*) AS c FROM saved_colleges WHERE student_id = ?', [studentId]);
  const [[checklistStats]] = await pool.query(
    'SELECT COUNT(*) AS total, SUM(is_done) AS done FROM application_checklists WHERE student_id = ?',
    [studentId]
  );
  const [upcomingDeadlines] = await pool.query(
    `SELECT a.id, a.application_end_date, c.name AS college_name, co.name AS course_name
     FROM deadlines d
     JOIN admissions a ON a.id = d.admission_id
     JOIN college_courses cc ON cc.id = a.college_course_id
     JOIN colleges c ON c.id = cc.college_id
     JOIN courses co ON co.id = cc.course_id
     WHERE d.student_id = ? AND d.is_dismissed = 0 AND a.application_end_date >= CURDATE()
     ORDER BY a.application_end_date ASC LIMIT 5`,
    [studentId]
  );

  const total = checklistStats.total || 0;
  const done = checklistStats.done || 0;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    savedCollegesCount: savedCount.c,
    checklist: { total, done, progressPercent },
    upcomingDeadlines,
  };
}

module.exports = {
  getStudentId,
  listSaved, saveCollege, unsaveCollege,
  listChecklist, addChecklistItem, toggleChecklistItem,
  updateProfile, dashboard,
};
