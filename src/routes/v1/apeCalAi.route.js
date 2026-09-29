const express = require('express');
const router = express.Router();

const { apeCalAiController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/analysis', apeCalAiController.getFeedback);
router.post('/proposal', apeCalAiController.generateHTMLProposal);
router.post('/proposal/doc', apeCalAiController.downloadProposalDoc);

router.post('/proposal/ai', apeCalAiController.aiProposal);


module.exports = router;