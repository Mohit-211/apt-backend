const httpStatus = require("http-status");
const slugify = require("slugify");
const { Sequelize, QueryTypes, Op } = require("sequelize");

const {
  Proposal,
  ProposalAttachment,
  User,
  ProposalViews,
  ProposalCategory,
  Category,
  ProposalCalculation,
} = require("../models");
const ApiError = require("../utils/ApiError");

const createProposal = async (reqBody, files) => {
  console.log(reqBody, files, "reqbody");
  const proposalObj = {
    title: reqBody.title,
    description: reqBody.description,
    proposal_type: reqBody.proposal_type,
  };

  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.images &&
    files.images.length !== 0
  ) {
    let currImage = files.images[0];
    proposalObj["file_uri"] = "/images";
    proposalObj["file_type"] = "Images";
    proposalObj["file_name"] = currImage.filename;
  }
  console.log("file11111====>", files, files.mimetype);
  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.docs &&
    files.docs.length !== 0
  ) {
    let currImage = files.docs[0];
    proposalObj["file_uri"] = "/docs";
    proposalObj["file_type"] = "Docs";
    proposalObj["file_name"] = currImage.filename;
  }
  console.log("file11111====>", files, files.docs, files.mimetype);
  let categoryArr = reqBody.categories;

  try {
    const proposalDoc = await Proposal.create(proposalObj);

    // Check if categories are provided before entering the loop
    if (categoryArr && categoryArr.length > 0) {
      for (const id of categoryArr) {
        const categoryObj = await Category.findOne({
          where: { id: id },
        });

        if (categoryObj && proposalDoc) {
          await ProposalCategory.create({
            proposal_id: proposalDoc.id,
            category_id: categoryObj.id,
            category_slug: categoryObj.slug,
            category_name: categoryObj.title,
          });
        } else {
          // Handle case where category is not found
          console.log(`Category '${id.trim()}' not found.`);
        }
      }
    }

    if (!proposalDoc)
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to create New Proposal"
      );

    return proposalDoc ? true : false;
  } catch (error) {
    console.log(error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create New Proposal"
    );
  }
};

const getAllProposal = async () => {
  const proposalDoc = await Proposal.findAll({
    where: { is_active: 1 },
    include: [
      {
        model: Category,
        through: {
          attributes: ["id", "category_slug", "proposal_id"],
        },
        attributes: ["id", "title"],
      },
    ],
  });
  if (!proposalDoc) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to get all Proposal"
    );
  }
  return proposalDoc;
};

const findProposalById = async (id) => {
  const proposalDoc = await Proposal.findOne({
    where: { id: id, is_active: true },
    include: [
      {
        model: Category,
        through: {
          attributes: ["id", "category_slug", "proposal_id"],
        },
      },
    ],
  });
  return proposalDoc ? proposalDoc : {};
};

const updateProposal = async (reqBody, files) => {
  const proposalDoc = await Proposal.findOne({
    where: {
      id: reqBody.proposal_id,
    },
  });

  if (!proposalDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Proposal not found");
  }

  let result = "";

  if (
    reqBody.title &&
    reqBody.title !== "" &&
    typeof reqBody.title !== "undefined"
  ) {
    proposalDoc["title"] = reqBody.title;
  }

  if (
    reqBody.description &&
    reqBody.description !== "" &&
    typeof reqBody.description !== "undefined"
  ) {
    proposalDoc["description"] = reqBody.description;
  }

  if (
    reqBody.proposal_type &&
    reqBody.proposal_type !== "" &&
    typeof reqBody.proposal_type !== "undefined"
  ) {
    proposalDoc["proposal_type"] = reqBody.proposal_type;
  }

  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.images &&
    files.images.length !== 0
  ) {
    let currImage = files.images[0];
    proposalDoc["file_uri"] = "/images";
    proposalDoc["file_name"] = currImage.filename;
  }

  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.docs &&
    files.docs.length !== 0
  ) {
    let currImage = files.docs[0];
    proposalDoc["file_uri"] = "/docs";
    proposalDoc["file_type"] = "Docs";
    proposalDoc["file_name"] = currImage.filename;
  }

  // Check if "categories" field is present in the request body
  if ("categories" in reqBody) {
    let categories = reqBody.categories;
    if (categories !== null && categories !== undefined && categories !== "") {
      categories = categories.split(",").map((elm) => Number(elm));
    }

    try {
      result = await proposalDoc.save();

      const existingCategories = await ProposalCategory.findAll({
        where: { proposal_id: proposalDoc.id },
      });

      let matchCategoryIds = [];
      let removedCategoryIds = [];

      existingCategories.map((elm) => {
        if (!categories.includes(elm.category_id)) {
          removedCategoryIds.push(elm.category_id);
        } else {
          matchCategoryIds.push(elm.category_id);
          categories = categories.filter((item) => item !== elm.category_id);
        }
      });

      removedCategoryIds.map(async (id) => {
        await ProposalCategory.destroy({
          where: { proposal_id: proposalDoc.id, category_id: id },
        });
      });

      for (const categoryId of categories) {
        const categoryObj = await Category.findOne({
          where: { id: categoryId },
        });

        if (categoryObj) {
          await ProposalCategory.create({
            proposal_id: proposalDoc.id,
            category_id: categoryObj.id,
            category_slug: categoryObj.slug,
            category_name: categoryObj.title,
          });
        } else {
          // Handle case where category is not found
          console.log(`Category '${categoryId.trim()}' not found.`);
        }
      }

      return result;
    } catch (error) {
      console.log(error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to Update New Proposal"
      );
    }
  } else {
    // Handle case where "categories" field is not provided
    console.log("No categories provided.");
    return result;
  }
};

const deleteProposal = async (reqBody) => {
  const proposalDoc = await Proposal.findOne({
    where: {
      id: reqBody.proposal_id,
    },
  });
  if (!proposalDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Proposal not found");
  }
  await proposalDoc.destroy();

  const proposalAttachmentDoc = await ProposalAttachment.findOne({
    where: { proposal_id: reqBody.proposal_id },
  });

  if (proposalAttachmentDoc) {
    await proposalAttachmentDoc.destroy();
  }
  //destroy proposalCategory
  const proposalCategoryDocs = await ProposalCategory.findAll({
    where: { proposal_id: reqBody.proposal_id },
  });

  // Iterate through each instance and destroy it
  for (const proposalCategoryDoc of proposalCategoryDocs) {
    await proposalCategoryDoc.destroy();
  }
  // Delete associated proposalViewDocs
  const proposalViewDocs = await ProposalViews.findAll({
    where: { proposal_id: reqBody.proposal_id },
  });

  // Iterate through each instance and destroy it
  for (const proposalViewDoc of proposalViewDocs) {
    await proposalViewDoc.destroy();
  }
  return proposalDoc;
};

const createProposalForUser = async (reqBody, files) => {
  const UserDoc = await User.findOne({
    where: { id: reqBody.user.id },
  });
  if (!UserDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  const proposalDoc = await Proposal.findOne({
    where: { id: reqBody.proposal_id },
  });
  if (!proposalDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Proposal not found");
  }

  // Check if the entry already exists
  const existingEntry = await ProposalAttachment.findOne({
    where: { user_id: reqBody.user.id, proposal_id: reqBody.proposal_id },
  });

  if (existingEntry) {
    return existingEntry;
  }

  const newEntryObj = {
    user_id: reqBody.user.id,
    proposal_id: reqBody.proposal_id,
  };

  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.docs &&
    files.docs.length !== 0
  ) {
    let currImage = files.docs[0];
    newEntryObj["file_uri"] = "/docs";
    newEntryObj["file_type"] = "Docs";
    newEntryObj["file_name"] = currImage.filename;
  }

  // Create a new entry
  const newEntryDoc = await ProposalAttachment.create(newEntryObj);

  return newEntryDoc;
};

const createProposalForUserUsingCalculatorData = async (reqBody) => {
  const UserDoc = await User.findOne({
    where: { id: reqBody.user.id },
  });
  if (!UserDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  // Check if draft_name already exists for the user
  // const existingDraft = await ProposalCalculation.findOne({
  //   where: {
  //     user_id: reqBody.user.id,
  //     draft_name: reqBody.draft_name,
  //   },
  // });

  // if (existingDraft) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Draft name already exists");
  // }

  const newEntryObj = {
    user_id: reqBody.user.id,
    draft_name: reqBody.draft_name,
    calculator_name: reqBody.calculator_name,
    proposal_name: reqBody.proposal_name,
    proposal_data: JSON.stringify(reqBody.proposal_data),
    calculator_data: JSON.stringify(reqBody.calculator_data),
  };

  // Create a new entry
  const newEntryDoc = await ProposalCalculation.create(newEntryObj);

  return newEntryDoc;
};

const getAllUserProposal = async (reqBody) => {
  const results = await ProposalCalculation.findAll({
    where: { user_id: reqBody.user.id, is_active: 1 },
  });

  if (!results || results.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }

  // Convert the data field to proper JSON format inside the array
  const formattedResults = results.map((result) => ({
    ...result.toJSON(),
    calculator_data: JSON.parse(result.calculator_data),
    proposal_data: JSON.parse(result.proposal_data),
  }));

  return formattedResults;
};

const getUserDraftById = async (params) => {
  const result = await ProposalCalculation.findOne({
    where: { id: params.id },
    attributes: ["id", "calculator_name", "calculator_data"],
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data not found");
  }

  const formattedResult = {
    ...result.toJSON(),
    calculator_data: JSON.parse(result.calculator_data),
  };

  return formattedResult;
};

const removeCalculationByDraftId = async (params) => {
  try {
    const draftDoc = await ProposalCalculation.findOne({
      where: {
        id: params.id,
      },
    });

    if (!draftDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, "Draft not found");
    }

    // Update only the calculator_data field
    const updatedDraftObj = await ProposalCalculation.update(
      {
        calculator_data: null,
      },
      {
        where: {
          id: params.id,
        },
      }
    );
    // return updatedDraftObj;
  } catch (error) {
    throw new ApiError(
      error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const updateUserDraft = async (reqBody, params) => {
  try {
    const draftDoc = await ProposalCalculation.findOne({
      where: {
        id: params.draft_id,
      },
    });

    if (!draftDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, "Draft not found");
    }

    const exitingDraftDoc = {
      id:draftDoc.id,
      user_id:draftDoc.user_id,
      is_active:draftDoc.is_active,
      created_at:draftDoc.created_at,
      updated_at:draftDoc.updated_at,
      draft_name: reqBody.draft_name,
      calculator_name: reqBody.calculator_name,
      proposal_name: reqBody.proposal_name,
      proposal_data: JSON.stringify(reqBody.proposal_data),
      calculator_data: JSON.stringify(reqBody.calculator_data),
    };
    const newDraftObj = await ProposalCalculation.update(exitingDraftDoc, {
      where: {
        id: params.draft_id,
      },
    });

    return exitingDraftDoc;
  } catch (error) {
    throw new ApiError(
      error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const deleteUserDraft = async (body) => {
  try {
    const { user, draft_id } = body;

    const draftDoc = await ProposalCalculation.findOne({
      where: {
        user_id: user.id,
        id: draft_id,
        is_active: 1,
      },
    });

    if (!draftDoc) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Draft Doesn't exist"
      );
    }
    await draftDoc.update({ is_active: 0 });

    return draftDoc;
  } catch (error) {
    throw new ApiError(
      error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const deleteUserProposal = async (reqBody) => {
  const proposalDoc = await ProposalAttachment.findOne({
    where: {
      proposal_id: reqBody.proposal_id,
      user_id: reqBody.user.id,
    },
  });
  if (!proposalDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Proposal not found");
  }
  await proposalDoc.destroy({
    where: {
      proposal_id: reqBody.proposal_id,
      user_id: reqBody.user.id,
      is_active: true,
    },
  });
};

const getProposalFromCategory = async (body, query, params) => {
  const { category_slug } = body;
  console.log("categoyrslug====>", category_slug);
  const { sortBy, limit, offset } = query;
  const {} = params;

  if (category_slug && category_slug != "all") {
    const blogDoc = await Proposal.findAndCountAll({
      distinct: true,
      where: {
        [Op.and]: [
          { is_active: true },
          {
            "$Categories.slug$": category_slug,
          },
        ],
      },
      include: [
        {
          model: Category,
          through: {
            attributes: [],
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    if (!blogDoc)
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to Get Proposal from this category"
      );
    return blogDoc;
  } else if (category_slug === "all" || !category_slug) {
    const allBlogs = await Proposal.findAndCountAll({
      distinct: true,
      include: [
        {
          model: Category,
          through: {
            attributes: [],
          },
          attributes: ["id", "title", "slug"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    return allBlogs;
  }
};

module.exports = {
  findProposalById,
  createProposal,
  updateProposal,
  getAllProposal,
  deleteProposal,
  createProposalForUser,
  getAllUserProposal,
  deleteUserProposal,
  getProposalFromCategory,
  createProposalForUserUsingCalculatorData,
  deleteUserDraft,
  updateUserDraft,
  getUserDraftById,
  removeCalculationByDraftId,
};
