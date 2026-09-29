const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Sequelize, QueryTypes, Op } = require("sequelize");
const moment = require("moment");
const randomize = require("randomatic");
const jwt = require("jsonwebtoken");

const sequelize = require("../config/central.db");
const {
  User,
  UserAttachment,
  BlogAttachment,
  BlogCategory,
  Category,
  Calculator,
  CalculatorViews,
  Proposal,
  ProposalViews,
} = require("../models");

const ApiError = require("../utils/ApiError");

const { result } = require("lodash");
const { required } = require("joi");

const getProfile = async (body) => {
  const { user } = body;
  let result = "";
  console.log("result====>", result);
  result = await User.findOne({
    attributes: [
      "id",
      "name",
      "email",
      "mobile",
      "user_status",
      "is_subscribed",
      "is_trial_period",
      "old_user",
    ],

    include: [
      {
        model: UserAttachment,
        as: "attachements",
        attributes: ["id", "title", "file_type", "file_name", "file_uri"],
        order: [["id", "desc"]],
        limit: 1,
        // required:false
      },
    ],
    where: { id: user?.id, is_active: true },
  });
  console.log("result====>", result);
  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to Get Profile.");

  return result;
};

const checkUserStatus = async (body) => {
  const { user } = body;
  let result = "";
  result = await User.findOne({
    attributes: ["user_status", "is_active"],
    where: { id: user?.id, is_active: true },
  });
  if (!result)
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to Get Profile.");

  return result;
};

const updateUserProfile = async (body, files) => {
  const { name, mobile, bussiness_name, user } = body;
  let userObj = {};

  if (name && typeof name === "string" && name !== "" && user.name !== name)
    userObj["name"] = name;

  if (
    mobile &&
    typeof mobile === "string" &&
    mobile !== "" &&
    user.mobile !== mobile
  )
    userObj["mobile"] = mobile;

  if (
    bussiness_name &&
    typeof bussiness_name === "string" &&
    bussiness_name !== "" &&
    user.bussiness_name !== bussiness_name
  )
    userObj["bussiness_name"] = bussiness_name;

  const userDoc = await User.update(userObj, {
    where: { id: user?.id, is_active: true },
  });

  if (!userDoc)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to Update Profile.",
    );

  let profileImage; // Define profileImage variable before the loop

  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.images &&
    files.images.length !== 0
  ) {
    // Delete existing user attachments
    await UserAttachment.destroy({
      where: { user_id: user.id, title: "Profile Image" },
    });

    // Insert new images
    for (let i = 0; i < files.images.length; i++) {
      let currImage = files.images[i];
      const userAttachmentObj = {
        user_id: user.id,
        title: "Profile Image",
        file_type: "Image",
        file_name: currImage.filename,
        file_uri: "/images",
        file_size: currImage.size,
      };
      await UserAttachment.create(userAttachmentObj);

      // Set profileImage variable to the updated image information
      profileImage = {
        file_name: currImage.filename,
        file_uri: "/images",
        file_size: currImage.size,
      };
    }
  }

  const newUpdatedUserDoc = await User.findOne({ where: { id: user?.id } });

  // Include profile picture information in the returned user document
  if (profileImage) {
    newUpdatedUserDoc.dataValues.profileImage = profileImage;
  }

  return newUpdatedUserDoc;
};

const deactivateAccount = async (reqBody) => {
  const { user } = reqBody;

  const isDeactivated = await User.destroy({ where: { id: user?.id } });

  if (!isDeactivated) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to Deactive your account.",
    );
  }
  return "";
};

const searchUserByNameOrUsername = async (body, query, params) => {
  const { name } = body;
  if (name.length < 4)
    throw new ApiError(httpStatus.BAD_REQUEST, "Minimum 4 character needed");
  const { sortBy, limit, offset } = query;

  try {
    let result = [];
    result = await User.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: UserAttachment,
          as: "attachements",
          attributes: ["id", "title", "file_type", "file_name", "file_uri"],
          order: [["id", "desc"]],
          limit: 1,
        },
      ],
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${name}%` } },
          { mobile: { [Op.like]: `%${name}%` } },
        ],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", `${sortBy}`]],
    });
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const notificationToogle = async (body) => {
  const { user } = body;
  user.notification = !user.notification;
  await user.save();
  return user;
};

const markCalculatorAsViewed = async (body, calculator_id) => {
  const { user } = body;
  const calculatorDoc = await Calculator.findOne({
    where: { id: calculator_id },
  });
  if (!calculatorDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Calculator not found");
  }

  const viewObj = {
    user_id: user.id,
    calculator_id: calculator_id,
  };

  // Create a new entry
  const viewDoc = await CalculatorViews.create(viewObj);
  if (!viewDoc)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to mark as viewed",
    );

  calculatorDoc.views_count =
    (calculatorDoc.views_count ? calculatorDoc.views_count : 0) + 1;
  await calculatorDoc.save();

  return viewDoc;
};

const markProposalAsViewed = async (body, proposal_id) => {
  const { user } = body;
  const proposalDoc = await Proposal.findOne({
    where: { id: proposal_id },
  });
  if (!proposalDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Proposal not found");
  }

  const viewObj = {
    user_id: user.id,
    proposal_id: proposal_id,
  };

  // Create a new entry
  const viewDoc = await ProposalViews.create(viewObj);
  if (!viewDoc)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to mark as viewed",
    );

  proposalDoc.views_count =
    (proposalDoc.views_count ? proposalDoc.views_count : 0) + 1;
  await proposalDoc.save();

  return viewDoc;
};

module.exports = {
  updateUserProfile,
  getProfile,
  deactivateAccount,
  searchUserByNameOrUsername,
  notificationToogle,
  markCalculatorAsViewed,
  markProposalAsViewed,
  checkUserStatus,
};
