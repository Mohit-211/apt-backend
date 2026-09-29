const express = require('express');
const router = express.Router();

const { businessController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth.middleware');

// Create Business
router.post(
    '/',
    [authMiddleware.verifyAuthJWTToken],
    businessController.createBusiness
);

// Get All Businesses
router.get(
    '/',
    [authMiddleware.verifyAuthJWTToken],
    businessController.getAllBusiness
);

// Get Business By ID
router.get(
    '/:id',
    [authMiddleware.verifyAuthJWTToken],
    businessController.findBusinessById
);

// Update Business
router.put(
    '/:id',
    [authMiddleware.verifyAuthJWTToken],
    businessController.updateBusiness
);

// Delete Business
router.delete(
    '/:id',
    [authMiddleware.verifyAuthJWTToken],
    businessController.deleteBusiness
);

module.exports = router;
