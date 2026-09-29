const express = require('express');
const router = express.Router();

const { calculatorController } = require('../../controllers');
const adminMiddleware = require('../../middlewares/admin.middleware');

router.post('/createCalculator', [adminMiddleware.validateJWTtoken], calculatorController.createCalculator);
router.get('/all', calculatorController.getAllCalculator);
router.get('/getCalculatorById',calculatorController.findCalculatorById);
router.put('/updateCalculator', [adminMiddleware.validateJWTtoken], calculatorController.updateCalculator);
router.delete('/deleteCalculator', [adminMiddleware.validateJWTtoken], calculatorController.deleteCalculator);
router.post('/getCalculatorFromSlug',calculatorController.getCalculatorFromSlug)


module.exports = router;