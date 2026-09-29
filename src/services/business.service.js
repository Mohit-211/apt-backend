const httpStatus = require("http-status");
const { Business } = require("../models");
const ApiError = require("../utils/ApiError");

const createBusiness = async (reqBody) => {
    const { user, name, description, location, type, category } = reqBody;

    if (!name || !location) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Name and location are required."
        );
    }

    const businessObj = {
        name,
        location,
        description: description || null,
        type: type || null,
        category: category || null,
        user_id: user.id
    };

    const business = await Business.create(businessObj);

    if (!business) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Failed to create new business."
        );
    }

    return business;
};

const getAllBusiness = async (reqBody) => {
    const { user } = reqBody;
    const businessList = await Business.findAll({
        where: { is_active: true, user_id: user.id },
    });

    return businessList;
};

const findBusinessById = async (reqBody, businessId) => {
    const { user } = reqBody;
    const business = await Business.findOne({
        where: { id: businessId, is_active: true, user_id: user.id },
    });

    if (!business) {
        throw new ApiError(httpStatus.NOT_FOUND, "Business not found");
    }

    return business;
};

const updateBusiness = async (reqBody, businessId) => {
    const { user, name, location, description, type, category } = reqBody;

    const business = await Business.findOne({
        where: { id: businessId, is_active: true, user_id: user.id }
    });

    if (!business) {
        throw new ApiError(httpStatus.NOT_FOUND, "Business not found");
    }

    if (name) business.name = name;
    if (location) business.location = location;
    if (description) business.description = description;
    if (type) business.type = type;
    if (category) business.category = category;

    await business.save();

    return business;
};

const deleteBusiness = async (reqBody, businessId) => {
    const { user } = reqBody;

    const business = await Business.findOne({
        where: { id: businessId, is_active: true, user_id: user.id }
    });
    console.log(business,"business")

    if (!business) {
        throw new ApiError(httpStatus.NOT_FOUND, "Business not found");
    }

    await business.destroy();
};

module.exports = {
    createBusiness,
    getAllBusiness,
    findBusinessById,
    updateBusiness,
    deleteBusiness,
};
