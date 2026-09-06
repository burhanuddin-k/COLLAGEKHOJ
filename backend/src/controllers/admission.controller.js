const admissionService = require('../services/admission.service');
const userService = require('../services/user.service');
const { asyncHandler } = require('../utils/apiError');

const listHandler = asyncHandler(async (req, res) => {
  const rows = await admissionService.list(req.query);
  res.status(200).json({ success: true, data: rows });
});

const trackDeadlineHandler = asyncHandler(async (req, res) => {
  const studentId = await userService.getStudentId(req.user.id);
  const result = await admissionService.trackDeadline(studentId, req.body.admissionId, req.body.remindAt);
  res.status(201).json({ success: true, data: result });
});

module.exports = { listHandler, trackDeadlineHandler };
