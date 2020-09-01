const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', adminController.getLogin);
router.get('/register', adminController.getRegister);
router.get('/all-visits', isAuth, adminController.getVisitsMonthly);
router.get('/add-company', isAuth, adminController.getAddCompany);
router.get('/report', isAuth, adminController.getCompaniesReport);

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
], isAuth, adminController.postAddCompany);

router.post('/login', adminController.postLogin);
router.post('/register', adminController.postRegister);
router.post('/email/:companyId', isAuth, adminController.postEmailReport);

module.exports = router;