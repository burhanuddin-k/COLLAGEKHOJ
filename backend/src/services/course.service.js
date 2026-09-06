const { pool } = require('../config/db');
const { ApiError } = require('../utils/apiError');

async function list({ degreeLevel, page = 1, limit = 20 }) {
  const where = [];
  const params = [];
  if (degreeLevel) { where.push('degree_level = ?'); params.push(degreeLevel); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Math.max(1, page) - 1) * limit;

  const [rows] = await pool.query(
    `SELECT id, name, slug, degree_level, full_name, duration_years FROM courses ${whereClause}
     ORDER BY name ASC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM courses ${whereClause}`, params);
  return { results: rows, total: countRows[0].total };
}

async function getBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM courses WHERE slug = ?', [slug]);
  const course = rows[0];
  if (!course) throw ApiError.notFound('Course not found');

  const [colleges] = await pool.query(
    `SELECT c.id, c.name, c.slug, ci.name AS city, st.name AS state
     FROM college_courses cc
     JOIN colleges c ON c.id = cc.college_id
     JOIN cities ci ON ci.id = c.city_id
     JOIN states st ON st.id = c.state_id
     WHERE cc.course_id = ? AND cc.is_published = 1 AND c.is_published = 1
     LIMIT 50`,
    [course.id]
  );

  return { course, colleges };
}

module.exports = { list, getBySlug };
