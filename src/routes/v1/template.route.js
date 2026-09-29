const express = require('express');
const router = express.Router();

const { templateController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', [authMiddleware.verifyAuthJWTToken], templateController.getAllTemplate);


module.exports = router;