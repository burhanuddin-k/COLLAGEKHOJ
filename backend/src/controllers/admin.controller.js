const adminService = require('../services/admin.service');
const { asyncHandler } = require('../utils/apiError');

const dashboardHandler = asyncHandler(async (req, res) => {
  const stats = await adminService.dashboardStats();
  const alerts = await adminService.dataQualityAlerts();
  res.status(200).json({ success: true, data: { stats, alerts } });
});

const dataQualityHandler = asyncHandler(async (req, res) => {
  const alerts = await adminService.dataQualityAlerts();
  res.status(200).json({ success: true, data: { alerts } });
});

const listCollegesHandler = asyncHandler(async (req, res) => {
  const rows = await adminService.listCollegesForModeration(req.query);
  res.status(200).json({ success: true, data: rows });
});

const verifyCollegeHandler = asyncHandler(async (req, res) => {
  const { status, publish, note } = req.body;
  const result = await adminService.verifyCollege(req.user.id, req.params.id, status, publish, note);
  res.status(200).json({ success: true, data: result });
});

const listPendingReviewsHandler = asyncHandler(async (req, res) => {
  const rows = await adminService.listPendingReviews(req.query);
  res.status(200).json({ success: true, data: rows });
});

const moderateReviewHandler = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const result = await adminService.moderateReview(req.user.id, req.params.id, status, note);
  res.status(200).json({ success: true, data: result });
});

const listUpdateRequestsHandler = asyncHandler(async (req, res) => {
  const rows = await adminService.listPendingUpdateRequests(req.query);
  res.status(200).json({ success: true, data: rows });
});

const resolveUpdateRequestHandler = asyncHandler(async (req, res) => {
  const { decision, note } = req.body;
  const result = await adminService.resolveUpdateRequest(req.user.id, req.params.id, decision, note);
  res.status(200).json({ success: true, data: result });
});

const auditLogsHandler = asyncHandler(async (req, res) => {
  const rows = await adminService.listAuditLogs(req.query);
  res.status(200).json({ success: true, data: rows });
});

module.exports = {
  dashboardHandler, dataQualityHandler,
  listCollegesHandler, verifyCollegeHandler,
  listPendingReviewsHandler, moderateReviewHandler,
  listUpdateRequestsHandler, resolveUpdateRequestHandler,
  auditLogsHandler,
};
