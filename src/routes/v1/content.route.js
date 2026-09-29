const express = require('express');
const router = express.Router();

const { contentController,bannerContentController,socialLoginController } = require('../../controllers');
const adminMiddleware = require('../../middlewares/admin.middleware');

router.post('/createContent', [adminMiddleware.validateJWTtoken], contentController.createContent);
router.get('/getAllContent', contentController.getAllContent);
router.get('/findContentById',contentController.findContentById);
router.put('/updateContent', [adminMiddleware.validateJWTtoken], contentController.updateContent);
router.delete('/deleteContent', [adminMiddleware.validateJWTtoken], contentController.deleteContent);

//social login api
router.post('/createSocialLogin',[adminMiddleware.validateJWTtoken] , socialLoginController.createSocialLogin);
router.get('/getAllSocialLogin', socialLoginController.getAllSocialLogin);
router.get('/findSocialLoginById', socialLoginController.findSocialLoginById);
router.put('/updateSocialLogin', [adminMiddleware.validateJWTtoken], socialLoginController.updateSocialLogin);
router.delete('/deleteSocialLogin', [adminMiddleware.validateJWTtoken], socialLoginController.deleteSocialLogin);

//banner content api
router.post('/createBannerContent',[adminMiddleware.validateJWTtoken] , bannerContentController.createBannerContent);
router.get('/getAllBannerContent', bannerContentController.getAllBannerContent);
router.get('/findBannerContentById', bannerContentController.findBannerContentById);
router.put('/updateBannerContent', [adminMiddleware.validateJWTtoken], bannerContentController.updateBannerContent);
router.delete('/deleteBannerContent', [adminMiddleware.validateJWTtoken], bannerContentController.deleteBannerContent);



module.exports = router;