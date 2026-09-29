const httpStatus = require("http-status");
const slugify = require("slugify");

const { BannerContent } = require("../models");
const ApiError = require("../utils/ApiError");

const createBannerContent = async (reqBody) => {
  const contentObj = {
    banner_content: reqBody.banner_content,
    heading: reqBody.heading,
  };

  const contentDoc = await BannerContent.create(contentObj);
  if (!contentDoc) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create new Content"
    );
  }
  return contentDoc ? true : false;
};

const getAllBannerContent = async () => {
  const contentDoc = await BannerContent.findAll({
    where: { is_active: true },
  });
  if (!contentDoc) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to get all BannerContent"
    );
  }
  return contentDoc;
};

const findBannerContentById = async (id) => {
  const contentDoc = await BannerContent.findOne({
    where: { id: id },
  });
  return contentDoc ? contentDoc : {};
};

const updateBannerContent = async (reqBody) => {
  const contentDoc = await BannerContent.findOne({
    where: {
      id: reqBody.content_id,
    },
  });

  if (!contentDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "BannerContent not found");
  }
  if (
    reqBody.banner_content &&
    reqBody.banner_content !== "" &&
    typeof reqBody.banner_content !== "undefined"
  ) {
    contentDoc["banner_content"] = reqBody.banner_content;
  }
  if (
    reqBody.heading &&
    reqBody.heading !== "" &&
    typeof reqBody.heading !== "undefined"
  ) {
    contentDoc["heading"] = reqBody.heading;
  }

  await contentDoc.save();

  return contentDoc ? contentDoc : {};
};

const deleteBannerContent = async (reqBody) => {
  const contentDoc = await BannerContent.findOne({
    where: {
      id: reqBody.content_id,
    },
  });
  if (!contentDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "BannerContent not found");
  }
  await contentDoc.destroy({
    where: { id: reqBody.content_id, is_active: true },
  });
};

module.exports = {
  createBannerContent,
  getAllBannerContent,
  findBannerContentById,
  updateBannerContent,
  deleteBannerContent,
};
