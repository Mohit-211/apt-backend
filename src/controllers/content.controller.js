const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { contentService } = require("../services");
const responseWrapper = require("../config/responseWrapper");

const createContent = catchAsync(async (req, res) => {
  const data = await contentService.createContent(req.body, req.files);
  return responseWrapper(
    res,
    data,
    "New Content Created Successfully.",
    httpStatus.OK
  );
});

const getAllContent = catchAsync(async (req, res) => {
  const contentDocs = await contentService.getAllContent();
  return responseWrapper(res, contentDocs, "");
});

const findContentById = catchAsync(async (req, res) => {
  const contentDoc = await contentService.findContentById(req.query.id);
  return responseWrapper(res, contentDoc, "");
});

const updateContent = catchAsync(async (req, res) => {
  const contentDoc = await contentService.updateContent(req.body, req.files);
  return responseWrapper(res, contentDoc, "Content Updated Successfully.");
});

const deleteContent = catchAsync(async (req, res) => {
  await contentService.deleteContent(req.body);
  return responseWrapper(res, "", "Deleted Successfull.");
});

module.exports = {
  createContent,
  findContentById,
  getAllContent,
  updateContent,
  deleteContent,
};
