const { body, query } = require('express-validator');

const searchRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('minFee').optional().isFloat({ min: 0 }).toFloat(),
  query('maxFee').optional().isFloat({ min: 0 }).toFloat(),
  query('sort')
    .optional()
    .isIn(['relevance', 'fees_asc', 'fees_desc', 'name', 'recently_verified']),
];

const createCollegeRules = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('College name is required'),
  body('cityId').isInt({ min: 1 }).withMessage('cityId is required'),
  body('stateId').isInt({ min: 1 }).withMessage('stateId is required'),
  body('collegeType')
    .isIn(['government', 'private', 'public', 'autonomous', 'university'])
    .withMessage('Invalid college type'),
  body('establishedYear').optional().isInt({ min: 1800, max: 2100 }),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
];

module.exports = { searchRules, createCollegeRules };
