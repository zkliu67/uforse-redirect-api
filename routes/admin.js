const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/all-companies', adminController.getCompany);
router.get('/add-company', adminController.getAddCompany);
router.get('/report/:companyId', adminController.getCompanyReport);
router.get('/report', adminController.getCompaniesReport);

router.post('/add-company', adminController.postAddCompany);
router.post('/email/:companyId', adminController.postEmailReport);

module.exports = router;