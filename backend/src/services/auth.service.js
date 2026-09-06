const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { signToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiError');

async function register({ fullName, email, password, phone, role }) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const finalRole = role === 'college' ? 'college' : 'student'; // admin accounts are never self-registered

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, finalRole, fullName, phone || null]
    );
    const userId = result.insertId;

    if (finalRole === 'student') {
      await conn.query(`INSERT INTO students (user_id) VALUES (?)`, [userId]);
    }

    await conn.commit();

    const token = signToken({ id: userId, role: finalRole, email });
    return { token, user: { id: userId, fullName, email, role: finalRole } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function login({ email, password }) {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = ?',
    [email]
  );
  const user = rows[0];

  // Same generic error whether the email doesn't exist or the password is
  // wrong, to avoid leaking which emails are registered.
  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return {
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
  };
}

async function getProfile(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.phone, u.created_at,
            s.preferred_course, s.preferred_state, s.preferred_city, s.budget_min, s.budget_max
     FROM users u
     LEFT JOIN students s ON s.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  if (rows.length === 0) throw ApiError.notFound('User not found');
  return rows[0];
}

module.exports = { register, login, getProfile };
