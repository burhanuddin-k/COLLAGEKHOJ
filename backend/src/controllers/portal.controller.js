const portalService = require('../services/portal.service');
const { asyncHandler } = require('../utils/apiError');

const myCollegeHandler = asyncHandler(async (req, res) => {
  const college = await portalService.myCollege(req.user.id);
  res.status(200).json({ success: true, data: college });
});

const claimHandler = asyncHandler(async (req, res) => {
  const result = await portalService.claimCollege(req.user.id, req.body.collegeId, req.body.proofDocumentUrl);
  res.status(201).json({
    success: true,
    data: result,
    message: 'Claim submitted. An admin will verify ownership before you get edit access.',
  });
});

const myClaimsHandler = asyncHandler(async (req, res) => {
  const rows = await portalService.myClaims(req.user.id);
  res.status(200).json({ success: true, data: rows });
});

const submitUpdateHandler = asyncHandler(async (req, res) => {
  const result = await portalService.submitUpdateRequest(req.user.id, req.body);
  res.status(201).json({
    success: true,
    data: result,
    message: 'Update submitted for admin review. It will go live once approved.',
  });
});

const myUpdateRequestsHandler = asyncHandler(async (req, res) => {
  const rows = await portalService.myUpdateRequests(req.user.id);
  res.status(200).json({ success: true, data: rows });
});

module.exports = {
  myCollegeHandler, claimHandler, myClaimsHandler, submitUpdateHandler, myUpdateRequestsHandler,
};
