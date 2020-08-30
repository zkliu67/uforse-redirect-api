const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/all-companies', adminController.getCompanies);
router.get('/company/:companyId', adminController.getCompany);
router.get('/add-company', adminController.getAddCompany);
router.get('/report/:companyId', adminController.getCompanyReport);
router.get('/report', adminController.getCompaniesReport);

router.post('/add-company',[
  body('companyName')
    .notEmpty(),
  body('contactName')
    .notEmpty(),
  body('startAt')
    .notEmpty(),
  body('contactEmail')
    .isEmail()
    .optional({checkFalsy: true})
    .withMessage('Please input a valid email address!'),
  body('contactPhone')
    .optional({checkFalsy: true})
    .isNumeric()
    .withMessage('Please input a valid phone number')
], adminController.postAddCompany);
router.post('/email/:companyId', adminController.postEmailReport);

module.exports = router;