const express = require('express');
const {
  myCollegeHandler, claimHandler, myClaimsHandler, submitUpdateHandler, myUpdateRequestsHandler,
} = require('../controllers/portal.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(requireAuth, requireRole('college'));

router.get('/my-college', myCollegeHandler);

router.post('/claims', body('collegeId').isInt({ min: 1 }), validate, claimHandler);
router.get('/claims', myClaimsHandler);

router.post(
  '/update-requests',
  body('collegeId').isInt({ min: 1 }),
  body('entityType').isIn(['college', 'college_course', 'fee', 'admission', 'facility', 'gallery']),
  body('payload').isObject(),
  validate,
  submitUpdateHandler
);
router.get('/update-requests', myUpdateRequestsHandler);

module.exports = router;
