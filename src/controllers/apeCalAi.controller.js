const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { apeCalAiService } = require("../services");
const responseWrapper = require("../config/responseWrapper");
const fs = require('fs');

const getFeedback = catchAsync(async (req, res) => {
    let result = await apeCalAiService.getFeedback(req.body);
    return responseWrapper(
        res,
        result
    );
});

const generateHTMLProposal = catchAsync(async (req, res) => {
    const result = await apeCalAiService.generateHTMLProposal(req.body);
    return responseWrapper(
        res,
        result
    );
});

const downloadProposalDoc = catchAsync(async (req, res) => {
    const filePath = await apeCalAiService.downloadProposalDoc(req.body);
    const fileName = 'proposal.docx';

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error("Error sending file:", err);
            return;
        }
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error deleting file:", unlinkErr);
            } else {
                console.log("Temporary file deleted:", filePath);
            }
        });
    });
});

const aiProposal = catchAsync(async (req, res) => {
    const result = await apeCalAiService.aiProposal(req.body);
    return responseWrapper(
        res,
        result
    );
});

module.exports = {
    getFeedback,
    generateHTMLProposal,
    downloadProposalDoc,
    aiProposal,
};