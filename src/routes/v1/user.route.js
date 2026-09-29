const express = require('express');
const router = express.Router();

const { userController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth.middleware');



router.get('/profile', [authMiddleware.verifyAuthJWTToken], userController.getProfile);

router.get('/checkUserStatus', [authMiddleware.verifyAuthJWTToken], userController.checkUserStatus);

router.put('/updateProfile', [authMiddleware.verifyAuthJWTToken], userController.updateUserProfile);

router.put('/notifications', [authMiddleware.verifyAuthJWTToken], userController.notificationToogle);

router.delete('/deactivate', [authMiddleware.verifyAuthJWTToken], userController.deactivateAccount);

router.post('/search', [authMiddleware.verifyAuthJWTToken], userController.searchUserByNameOrUsername);

router.post('/markCalculatorAsViewed', [authMiddleware.verifyAuthJWTToken], userController.markCalculatorAsViewed);

router.post('/markProposalAsViewed', [authMiddleware.verifyAuthJWTToken], userController.markProposalAsViewed);

module.exports = router;