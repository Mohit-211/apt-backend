const httpStatus = require("http-status");
const slugify = require("slugify");

const { Calculator, CalculatorAttachment, CalculatorViews } = require("../models");
const ApiError = require("../utils/ApiError");

const createCalculator = async (reqBody, files) => {
  const existingCalculator = await Calculator.findOne({
    where: {
      slug: slugify(reqBody.calculator_name, { lower: true }),
    },
  });
  if (existingCalculator) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Calculator with the same title already exists"
    );
  }
  const calculatorObj = {
    calculator_name: reqBody.calculator_name,
    description: reqBody.description,
    calculator_use: reqBody.calculator_use,
    profit_margin_formula: reqBody.profit_margin_formula,
  };

  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.images &&
    files.images.length !== 0
  ) {
    let currImage = files.images[0];
    calculatorObj["file_uri"] = "/images";
    calculatorObj["file_name"] = currImage.filename;
  }

  const calculatorDoc = await Calculator.create(calculatorObj);
  if (!calculatorDoc) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create new Calculator"
    );
  }

  return calculatorDoc ? true : false;
};

const getAllCalculator = async () => {
  const calculatorDoc = await Calculator.findAll({
    where: { is_active: 1 },
  });
  if (!calculatorDoc) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to get all Calculator"
    );
  }
  return calculatorDoc;
};

const findCalculatorById = async (id) => {
  const calculatorDoc = await Calculator.findOne({
    where: { id: id },
  });
  return calculatorDoc ? calculatorDoc : {};
};

const updateCalculator = async (reqBody, files) => {
  const calculatorDoc = await Calculator.findOne({
    where: {
      id: reqBody.calculator_id,
    },
  });

  if (!calculatorDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Calculator not found");
  }
  if (
    reqBody.calculator_name &&
    reqBody.calculator_name !== "" &&
    typeof reqBody.calculator_name !== "undefined"
  ) {
    calculatorDoc["calculator_name"] = reqBody.calculator_name;
  }
  if (
    reqBody.description &&
    reqBody.description !== "" &&
    typeof reqBody.description !== "undefined"
  ) {
    calculatorDoc["description"] = reqBody.description;
  }
  if (
    reqBody.calculator_use &&
    reqBody.calculator_use !== "" &&
    typeof reqBody.calculator_use !== "undefined"
  ) {
    calculatorDoc["calculator_use"] = reqBody.calculator_use;
  }
  if (
    reqBody.profit_margin_formula &&
    reqBody.profit_margin_formula !== "" &&
    typeof reqBody.profit_margin_formula !== "undefined"
  ) {
    calculatorDoc["profit_margin_formula"] = reqBody.profit_margin_formula;
  }

  if (
    files &&
    Object.keys(files).length !== 0 &&
    files.images &&
    files.images.length !== 0
  ) {
    let currImage = files.images[0];
    calculatorDoc["file_uri"] = "/images";
    calculatorDoc["file_name"] = currImage.filename;
  }
  await calculatorDoc.save();

  return calculatorDoc ? calculatorDoc : {};
};

const deleteCalculator = async (reqBody) => {
  const calculatorDoc = await Calculator.findOne({
    where: {
      id: reqBody.calculator_id,
    },
  });
  console.log("calaculatorid===>",reqBody.calculator_id)
  console.log("reqbody===>",reqBody)
  if (!calculatorDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Calculator not found");
  }
  await calculatorDoc.destroy();

  // Delete associated CalculatorViews
  const calculatorViewDocs = await CalculatorViews.findAll({
    where: { calculator_id: reqBody.calculator_id },
  });

  // Iterate through each instance and destroy it
  for (const calculatorViewDoc of calculatorViewDocs) {
    await calculatorViewDoc.destroy();
  }

  return calculatorDoc;
};

const getCalculatorFromSlug = async (reqBody) => {
  const calculatorDoc = await Calculator.findOne({
    where: { slug: reqBody.calculator_slug },
  });

  // if (!calculatorDoc)
  //   throw new ApiError(
  //     httpStatus.OK,
  //     "Data Not found"
  //   );
  return calculatorDoc;
};

module.exports = {
  findCalculatorById,
  createCalculator,
  updateCalculator,
  getAllCalculator,
  deleteCalculator,
  getCalculatorFromSlug,
};
