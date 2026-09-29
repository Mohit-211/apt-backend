const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { templateService } = require("../services");
const responseWrapper = require("../config/responseWrapper");

const getAllTemplate = catchAsync(async (req, res) => {
    const result = await templateService.getAllTemplate();
    return responseWrapper(
        res,
        result
    );
});

module.exports = {
    getAllTemplate,
};
