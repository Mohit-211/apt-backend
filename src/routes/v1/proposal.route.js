const express = require('express');
const router = express.Router();

const { proposalController } = require('../../controllers');
const adminMiddleware = require('../../middlewares/admin.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const { proposalService } = require('../../services');

router.post('/createProposalForUser', [authMiddleware.verifyAuthJWTToken], proposalController.createProposalForUser);
router.post('/createProposalForUserUsingCalculatorData', [authMiddleware.verifyAuthJWTToken], proposalController.createProposalForUserUsingCalculatorData);
router.get('/getAllUserProposal',[authMiddleware.verifyAuthJWTToken],proposalController.getAllUserProposal);
router.get('/getCalculatorByDraftId/:id',proposalController.getUserDraftById);
router.post('/removeCalculationByDraftId/:id',[authMiddleware.verifyAuthJWTToken],proposalController.removeCalculationByDraftId)
router.post('/updateUserDraft/:draft_id',[authMiddleware.verifyAuthJWTToken],proposalController.updateUserDraft)
router.post('/deleteUserDraft',[authMiddleware.verifyAuthJWTToken],proposalController.deleteUserDraft)
router.delete('/deleteUserProposal', [authMiddleware.verifyAuthJWTToken], proposalController.deleteUserProposal);


router.get('/all', proposalController.getAllProposal);
router.get('/getProposalById',proposalController.findProposalById);


router.post('/createProposal', [adminMiddleware.validateJWTtoken], proposalController.createProposal);
router.put('/updateProposal', [adminMiddleware.validateJWTtoken], proposalController.updateProposal);
router.delete('/deleteProposal', [adminMiddleware.validateJWTtoken], proposalController.deleteProposal);

router.post('/get-proposal-from-category',proposalController.getProposalFromCategory)


module.exports = router;