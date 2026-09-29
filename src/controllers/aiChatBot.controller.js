const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const { aiChatBotService } = require("../services");
const responseWrapper = require("../config/responseWrapper");
const fs = require('fs');

const aiProposalChatBot = catchAsync(async (req, res) => {
    let result = await aiChatBotService.aiProposalChatBot(req.body);
    return responseWrapper(
        res,
        result
    );
});


const getConversationChats = catchAsync(async (req, res) => {
    let result = await aiChatBotService.getConversationChats(req.body);
    return responseWrapper(
        res,
        result
    );
});

const getAllConversations = catchAsync(async (req, res) => {
    let result = await aiChatBotService.getAllConversations(req.body);
    return responseWrapper(
        res,
        result
    );
});

const deleteConversation = catchAsync(async (req, res) => {
    let result = await aiChatBotService.deleteConversation(req.body, req.params);
    return responseWrapper(
        res,
        '',
        result
    );
});

const increateLengthOfProposal = catchAsync(async (req, res) => {
    let result = await aiChatBotService.increateLengthOfProposal(req.body);
    return responseWrapper(
        res,
        result
    );
});

const decreaseLengthOfProposal = catchAsync(async (req, res) => {
    let result = await aiChatBotService.decreaseLengthOfProposal(req.body);
    return responseWrapper(
        res,
        result
    );
});

const updateMessage = catchAsync(async (req, res) => {
    let result = await aiChatBotService.updateMessage(req.body);
    return responseWrapper(
        res,
        result,
        'Message updated successfully.'
    );
});

module.exports = {
    aiProposalChatBot,
    getConversationChats,
    getAllConversations,
    deleteConversation,
    increateLengthOfProposal,
    decreaseLengthOfProposal,
    updateMessage,
};