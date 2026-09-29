const express = require('express');
const router = express.Router();

const {adminController,roleController} = require('../../controllers');
const adminMiddleware = require('../../middlewares/admin.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');


router.post('/register', [adminMiddleware.validateCreateAdminBody], adminController.createAdminUser);
router.post('/login', [adminMiddleware.validateLoginAdminBody], adminController.loginAdminUser);
router.post('/change-password', [adminMiddleware.validateResetPassordBody, adminMiddleware.validateJWTtoken], adminController.resetAdminPassword);
router.post('/otp',  adminController.sendOTP);
router.post('/verify-otp',  adminController.verifyOTP);
router.post('/forgot-password',  adminController.forgotAdminPassword);
router.put('/updateAdmin',[adminMiddleware.validateJWTtoken],adminController.updateAdmin)
router.delete('/deleteAdmin',[adminMiddleware.validateJWTtoken],adminController.deleteAdmin)
router.get('/getAllAdmin',[adminMiddleware.validateJWTtoken,roleMiddleware.isSuperAdmin],adminController.getAllAdmins)
router.get('/getAdminProfile',[adminMiddleware.validateJWTtoken],adminController.getProfile)
router.get('/getAdminById',adminController.findAdminById)

router.get('/getAllUsers',[adminMiddleware.validateJWTtoken,roleMiddleware.isSuperAdmin],adminController.getAllUsers);
router.get('/getUserById',adminController.getUserById)
router.delete('/deleteUser',[adminMiddleware.validateJWTtoken],adminController.deleteUser)
router.post('/createUser',[adminMiddleware.validateJWTtoken],adminController.adminAddUser);

router.post('/updateUserStatus',adminController.updateUserStatus)


router.get('/getCount',[adminMiddleware.validateJWTtoken,roleMiddleware.isSuperAdmin],adminController.getUserCount)
router.get('/getUserCountByMonth',adminController.getUserCountByMonth);
router.get('/getProposalCount',adminController.getProposalCount);
router.get('/getMostViewedCalculator',adminController.getMostViewedCalculator);
router.get('/getMostViewedProposal',adminController.getMostViewedProposal);
router.post('/getLoginLogsOfUser',adminController.getLoginLogsOfUser);





module.exports = router;