const express = require('express');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/all-companies', adminController.getCompany);
router.get('/add-company', adminController.getAddCompany);
router.post('/add-company', adminController.postAddCompany);

module.exports = router;