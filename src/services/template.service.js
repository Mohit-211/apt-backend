const httpStatus = require("http-status");
const { Template } = require("../models");
const ApiError = require("../utils/ApiError");



const getAllTemplate = async () => {
    try {
        const result = await Template.findAll({ is_active: true });
        return result;

    } catch (error) {
        console.log(error)
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

module.exports = {
    getAllTemplate,
};
