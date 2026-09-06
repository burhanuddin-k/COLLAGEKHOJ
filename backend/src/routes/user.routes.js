const express = require('express');
const {
  meHandler, updateMeHandler, dashboardHandler,
  listSavedHandler, saveCollegeHandler, unsaveCollegeHandler,
  listChecklistHandler, addChecklistItemHandler, toggleChecklistItemHandler,
} = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth, requireRole('student'));

router.get('/me', meHandler);
router.put('/me', updateMeHandler);
router.get('/dashboard', dashboardHandler);

router.get('/saved-colleges', listSavedHandler);
router.post('/saved-colleges', saveCollegeHandler);
router.delete('/saved-colleges/:collegeId', unsaveCollegeHandler);

router.get('/checklist', listChecklistHandler);
router.post('/checklist', addChecklistItemHandler);
router.patch('/checklist/:id', toggleChecklistItemHandler);

module.exports = router;
