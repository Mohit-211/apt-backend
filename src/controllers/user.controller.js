const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Sequelize, QueryTypes, Op } = require("sequelize");
const moment = require("moment");

const catchAsync = require("../utils/catchAsync");

const { userService } = require("../services");
const pick = require("../utils/pick");
const responseWrapper = require("../config/responseWrapper");

const getProfile = catchAsync(async (req, res) => {
  const response = await userService.getProfile(req.body);
  return responseWrapper(res, response, "Successfully get profile");
});

const checkUserStatus = catchAsync(async (req, res) => {
  const response = await userService.checkUserStatus(req.body);
  return responseWrapper(res, response);
});

const updateUserProfile = catchAsync(async (req, res) => {
  const body = pick(req.body, ["name", "mobile", "user"]);
  const response = await userService.updateUserProfile(body, req.files);
  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    message: response ? "Profile Updated Successfully" : "Failed",
    data: response,
  });
});

const deactivateAccount = catchAsync(async (req, res) => {
  const response = await userService.deactivateAccount(req.body);
  return responseWrapper(res, response, "Account Successfully Deactivated.");
});

const searchUserByNameOrUsername = catchAsync(async (req, res) => {
  const body = pick(req.body, ["name", "user"]);
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
  const response = await userService.searchUserByNameOrUsername(
    body,
    query,
    params
  );
  return responseWrapper(res, response, "");
});

const notificationToogle = catchAsync(async (req, res) => {
  const body = pick(req.body, ["user"]);
  const response = await userService.notificationToogle(body);
  message =
    response.notification === true
      ? "Notification turned On!"
      : "Notification turned Off!";
  return responseWrapper(res, "", message);
});

const markCalculatorAsViewed = catchAsync(async (req, res) => {
  const calculator = await userService.markCalculatorAsViewed(req.body,req.query.calculator_id);

  if (!calculator) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Unable to Mark as viewd"
    );
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: calculator,
    message: "Succssfully marked calculator as viewed",
  });
});

const markProposalAsViewed = catchAsync(async (req, res) => {
  const proposal = await userService.markProposalAsViewed(req.body,req.query.proposal_id);

  if (!proposal) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Unable to Mark as viewd"
    );
  }

  res.status(httpStatus.OK).send({
    code: httpStatus.OK,
    data: proposal,
    message: "Succssfully marked proposal as viewed",
  });
});





module.exports = {
  updateUserProfile,
  getProfile,
  deactivateAccount,
  searchUserByNameOrUsername,
  notificationToogle,
  markCalculatorAsViewed,
  markProposalAsViewed,
  checkUserStatus
};
