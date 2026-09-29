const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { proposalService } = require("../services");
const responseWrapper = require("../config/responseWrapper");
const pick = require("../utils/pick");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");

const createProposal = catchAsync(async (req, res) => {
  await proposalService.createProposal(req.body,req.files);
  return responseWrapper(
    res,
    "",
    "New Proposal Created Successfully.",
    httpStatus.OK
  );
});

const getAllProposal = catchAsync(async (req, res) => {
  const proposalDocs = await proposalService.getAllProposal();
  return responseWrapper(res, proposalDocs, "");
});

const findProposalById = catchAsync(async (req, res) => {
  const proposalDocs = await proposalService.findProposalById(req.query.id);
  return responseWrapper(res, proposalDocs, "");
});

const updateProposal = catchAsync(async (req, res) => {
  const proposalDocs = await proposalService.updateProposal(req.body,req.files);
  return responseWrapper(res, proposalDocs, "Proposal Update Successfully.");
});

const deleteProposal = catchAsync(async (req, res) => {
  await proposalService.deleteProposal(req.body);
  return responseWrapper(res, "", "Deleted Successfull.");
});

const createProposalForUser = catchAsync(async (req, res) => {
  const response = await proposalService.createProposalForUser(
    req.body,
    req.files
  );

  return responseWrapper(res, response, "", httpStatus.OK);
});

const createProposalForUserUsingCalculatorData = catchAsync(async (req, res) => {
  const response = await proposalService.createProposalForUserUsingCalculatorData(
    req.body,
  );

  return responseWrapper(res, response, "", httpStatus.OK);
});

const getAllUserProposal = catchAsync(async (req, res) => {
  try {
    const response = await proposalService.getAllUserProposal(req.body);
    return responseWrapper(res, response, "", httpStatus.OK);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === httpStatus.BAD_REQUEST) {
      // If it's a BAD_REQUEST ApiError, return the error response with status 400
      return res.status(httpStatus.BAD_REQUEST).json({ status: 400, message: error.message });
    } else {
      // For other errors, return a generic 500 error response
      return res.status(500).json({ status: 500, message: "Data not found" });
    }
  }
});

const getUserDraftById = catchAsync(async (req, res) => {
  const proposalDocs = await proposalService.getUserDraftById(req.params);
  return responseWrapper(res, proposalDocs, "");
});

const removeCalculationByDraftId = catchAsync(async (req, res) => {
  const proposalDocs = await proposalService.removeCalculationByDraftId(req.params);
  return responseWrapper(res, proposalDocs, "Draft Update Successfully.");
});


const updateUserDraft = catchAsync(async (req, res) => {
  const proposalDocs = await proposalService.updateUserDraft(req.body,req.params);
  return responseWrapper(res, proposalDocs, "Draft Update Successfully.");
});

const deleteUserDraft = catchAsync(async (req, res) => {
  await proposalService.deleteUserDraft(req.body);
  return responseWrapper(res, "", "Deleted Successfull.");
});


const deleteUserProposal = catchAsync(async (req, res) => {
  await proposalService.deleteUserProposal(req.body);
  return responseWrapper(res, "", "Deleted Successfull.");
});

const getProposalFromCategory = catchAsync(async (req, res) => {
  const body = pick(req.body, ["category_slug"]);
  const query = pick(req.query, ["sortBy", "limit", "page"]);
  const params = pick(req.params, []);

  if (!query["limit"]) {
    query["limit"] = config.defaultLimit;
  }
  if (!query["page"]) {
    query["page"] = 1;
  }
  if (!query["sortBy"] || query["sortBy"] === "") {
    query["sortBy"] = "ASC";
  }
  let offset = (query["page"] - 1) * query["limit"];
  query["offset"] = offset;
  const response = await proposalService.getProposalFromCategory(body, query, params);
  return responseWrapper(res, response, "Success", httpStatus.OK);
});

module.exports = {
  createProposal,
  findProposalById,
  getAllProposal,
  updateProposal,
  deleteProposal,
  createProposalForUser,
  getAllUserProposal,
  deleteUserProposal,
  getProposalFromCategory,
  createProposalForUserUsingCalculatorData,
  updateUserDraft,
  deleteUserDraft,
  getUserDraftById,
  removeCalculationByDraftId
};
