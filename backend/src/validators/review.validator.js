const { body } = require('express-validator');

const createReviewRules = [
  body('collegeId').isInt({ min: 1 }),
  body('courseId').optional().isInt({ min: 1 }),
  body('academicYear').optional().isString().isLength({ max: 20 }),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 20, max: 5000 }),
  body(['ratingAcademics', 'ratingFaculty', 'ratingCampus', 'ratingInfrastructure', 'ratingAdministration', 'ratingValue'])
    .isInt({ min: 1, max: 5 })
    .withMessage('All ratings must be between 1 and 5'),
];

module.exports = { createReviewRules };
