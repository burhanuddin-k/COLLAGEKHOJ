const { body } = require('express-validator');

const registerRules = [
  body('fullName').trim().isLength({ min: 2, max: 150 }).withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .optional()
    .isIn(['student', 'college'])
    .withMessage('Role must be student or college (admin accounts are created internally)'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
