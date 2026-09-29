const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { businessService } = require("../services");
const responseWrapper = require("../config/responseWrapper");

const createBusiness = catchAsync(async (req, res) => {
    await businessService.createBusiness(req.body);
    return responseWrapper(
        res,
        "",
        "New Business Created Successfully.",
        httpStatus.OK
    );
});

const getAllBusiness = catchAsync(async (req, res) => {
    const contentDocs = await businessService.getAllBusiness(req.body);
    return responseWrapper(res, contentDocs, "");
});

const findBusinessById = catchAsync(async (req, res) => {
    const contentDoc = await businessService.findBusinessById(
        req.body,
        req.params.id
    );
    return responseWrapper(res, contentDoc, "");
});

const updateBusiness = catchAsync(async (req, res) => {
    const contentDoc = await businessService.updateBusiness(req.body, req.params.id);
    return responseWrapper(res, contentDoc, "Business Updated Successfully.");
});

const deleteBusiness = catchAsync(async (req, res) => {
    await businessService.deleteBusiness(req.body, req.params.id);
    return responseWrapper(res, "", "Deleted Successfull.");
});

module.exports = {
    createBusiness,
    getAllBusiness,
    findBusinessById,
    updateBusiness,
    deleteBusiness,
};
