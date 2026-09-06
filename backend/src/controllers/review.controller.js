const reviewService = require('../services/review.service');
const { asyncHandler } = require('../utils/apiError');

const listForCollegeHandler = asyncHandler(async (req, res) => {
  const rows = await reviewService.listForCollege(req.params.collegeId, req.query);
  res.status(200).json({ success: true, data: rows });
});

const createHandler = asyncHandler(async (req, res) => {
  const result = await reviewService.create(req.user.id, req.body);
  res.status(201).json({
    success: true,
    data: result,
    message: 'Thanks! Your review is pending moderation and will appear once approved.',
  });
});

const reportHandler = asyncHandler(async (req, res) => {
  const result = await reviewService.report(req.user.id, req.params.id, req.body.reason);
  res.status(200).json({ success: true, ...result });
});

module.exports = { listForCollegeHandler, createHandler, reportHandler };
