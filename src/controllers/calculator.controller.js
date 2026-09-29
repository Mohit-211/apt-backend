const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { calculatorService } = require("../services");
const responseWrapper = require("../config/responseWrapper");

const createCalculator = catchAsync(async (req, res) => {
  await calculatorService.createCalculator(req.body,req.files);
  return responseWrapper(
    res,
    "",
    "New Calculator Created Successfully.",
    httpStatus.OK
  );
});

const getAllCalculator = catchAsync(async (req, res) => {
  const calculatorDocs = await calculatorService.getAllCalculator();
  return responseWrapper(res, calculatorDocs, "");
});

const findCalculatorById = catchAsync(async (req, res) => {
  const calculatorDoc = await calculatorService.findCalculatorById(
    req.query.id
  );
  return responseWrapper(res, calculatorDoc, "");
});

const updateCalculator = catchAsync(async (req, res) => {
  const calculatorDoc = await calculatorService.updateCalculator(req.body,req.files);
  return responseWrapper(res, calculatorDoc, "Calculator Update Successfully.");
});

const deleteCalculator = catchAsync(async (req, res) => {
  await calculatorService.deleteCalculator(req.body);
  return responseWrapper(res, "", "Deleted Successfull.");
});


const getCalculatorFromSlug = catchAsync(async (req, res) => {
 
  const response = await calculatorService.getCalculatorFromSlug(req.body);
  return responseWrapper(res, response, "Success", httpStatus.OK);
});

module.exports = {
  createCalculator,
  findCalculatorById,
  getAllCalculator,
  updateCalculator,
  deleteCalculator,
  getCalculatorFromSlug
};
