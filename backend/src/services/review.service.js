const { pool } = require('../config/db');
const { ApiError } = require('../utils/apiError');

async function listForCollege(collegeId, { page = 1, limit = 10 }) {
  const offset = (Math.max(1, page) - 1) * limit;
  const [rows] = await pool.query(
    `SELECT r.id, r.title, r.description, r.academic_year, r.rating_overall,
            r.rating_academics, r.rating_faculty, r.rating_campus, r.rating_infrastructure,
            r.rating_administration, r.rating_value, r.created_at, co.name AS course_name
     FROM reviews r
     LEFT JOIN courses co ON co.id = r.course_id
     WHERE r.college_id = ? AND r.status = 'approved'
     ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    [collegeId, Number(limit), Number(offset)]
  );
  return rows;
}

// Only students may submit a review; it always starts 'pending' and is
// never shown publicly until an admin approves it.
async function create(studentUserId, body) {
  const [studentRows] = await pool.query('SELECT id FROM students WHERE user_id = ?', [studentUserId]);
  const student = studentRows[0];
  if (!student) throw ApiError.forbidden('Only student accounts can submit reviews');

  const [collegeRows] = await pool.query('SELECT id FROM colleges WHERE id = ? AND is_published = 1', [body.collegeId]);
  if (collegeRows.length === 0) throw ApiError.notFound('College not found');

  const [result] = await pool.query(
    `INSERT INTO reviews
      (college_id, student_id, course_id, academic_year, title, description,
       rating_academics, rating_faculty, rating_campus, rating_infrastructure,
       rating_administration, rating_value, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      body.collegeId, student.id, body.courseId || null, body.academicYear || null,
      body.title, body.description,
      body.ratingAcademics, body.ratingFaculty, body.ratingCampus,
      body.ratingInfrastructure, body.ratingAdministration, body.ratingValue,
    ]
  );
  return { id: result.insertId, status: 'pending' };
}

async function report(reportedByUserId, reviewId, reason) {
  const [reviewRows] = await pool.query('SELECT id FROM reviews WHERE id = ?', [reviewId]);
  if (reviewRows.length === 0) throw ApiError.notFound('Review not found');

  await pool.query(
    `INSERT INTO reports (reportable_type, reportable_id, reported_by_user_id, reason)
     VALUES ('review', ?, ?, ?)`,
    [reviewId, reportedByUserId, reason]
  );
  return { message: 'Review reported. Our moderation team will take a look.' };
}

module.exports = { listForCollege, create, report };
