const fs = require('fs');
const path = require('path');
const moment = require('moment');
const brcypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');

const { sendError } = require('../helper/errorHelper');
const reportHelper = require('../helper/reportHelper');
const otherHelper = require('../helper/otherHelper');

const { sendMail } = require('../helper/emailHelper');
const visitHelper = require('../helper/visitHelper');

const HttpStatus = require('http-status');

const Company = require('../models/company');
const Visit = require('../models/vist');
const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
  
  res.render('login', {
    pageTitle: 'Login'
  });
}

exports.postLogin = async (req, res, next) => {
  const {username, password} = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 422 indicates validation error
    // instead of redirect
    return sendError(res, HttpStatus.BAD_REQUEST, errors, 'Bad request');
  }

  try {
    const user = await User.findOne({username: username});
    if (!user) { return res.redirect('/admin/login'); }

    const doMatch = await brcypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      // req.session.user = user;

      await req.session.save()
      res.redirect('/admin/all-visits' );
    }

    else {
      return res.redirect('/admin/login');
    }  
  } catch (err) {
    next(err);
  }
}

exports.getRegister = (req, res, next) => {
  res.render('register', {
    pageTitle: 'Register'
  })
}

exports.postRegister = async (req, res, next) => {
  const {username, password, password2} = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 422 indicates validation error
    // instead of redirect
    return sendError(res, HttpStatus.BAD_REQUEST, errors, 'Bad request');
  }

  try {
    const hashedPassword = await brcypt.hash(password, 12)
    const newUser = new User({
      username: username,
      password: hashedPassword
    });

    await newUser.save();
    res.redirect('/admin/login');
  } catch (err) {
    next(err);
  }
}

exports.getLogout = (req, res, next) => {
  req.session.isLoggedIn = false;
  res.redirect('/admin/login');
}

exports.getVisitsMonthly = async (req, res, next) => {
  try {
    const companies = await Company.find();
    const visits = await Visit.find();

    console.log(req.session);

    if (req.query.monthDate) {
      const monthDate = req.query.monthDate.split('-');
      // get daily visits with month data.
      const result = await visitHelper.getDailyVisitsByMonth({
        year: monthDate[0],
        month: monthDate[1]
      })
      
      res.render('includes/visit-table-row.ejs', {
        companies: companies,
        allVisits: result,
        daily: true
      });

    } else {
      const allVisits = await visitHelper.CompaniesVisitsMonthly();
      res.render('all-visits-record', {
        pageTitle: 'Montly Visits',
        isLoggedIn: req.session.isLoggedIn,
        visitsCount: visits.length,
        allVisits: allVisits,
        companies: companies,
        moment: moment,
        daily: false
      })
      // res.status(200).json({
      //   monthlyVisits: allVisits
      // })
    }
    
  } catch (err) {
    next(err);
  }
}

exports.getCompaniesReport = async (req, res, next) => {
  // get monthly report
  if (req.query.month) {
    const yearMonth = req.query.month.split('-');
    const companies = await Company.find().lean();
    const companyNames = companies.map(company => company.companyName);

    const dailyVisits = await visitHelper.getDailyVisitsByMonth({
      year: yearMonth[0],
      month: yearMonth[1]
    });

    const reportName = `${req.query.month}-daily-visits.pdf`;
    const reportPath = path.join('data', 'reports', reportName);

    const pdfReport = reportHelper.generateReport(new PDFDocument(), companyNames, dailyVisits);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + reportName + '"'
    );

    pdfReport.pipe(fs.createWriteStream(reportPath));
    pdfReport.pipe(res);

  } else {
    const error = new Error('Invalid Endpoint');
    error.httpStatusCode = 404;
    return next(error);
  }
}

exports.getCompanyReport = async (req, res, next) => {
  const companyId = req.params.companyId;
  try {
    const company = await Company.findById(companyId).exec();
    
    if (company == null) { sendError(res, HttpStatus.UNAUTHORIZED, null, 'invalid company id'); }

    let monthReport = new Map();
    company.records.map((record) => {
      let month = record.enterAt.getMonth() + 1;
      month = month < 10 ? '0'+month : month;
      const year = record.enterAt.getFullYear();
      const date = `${year}-${month}`.toString();
      
      if (!monthReport.has(date)) {
        monthReport.set(date, 1);
      } else {
        monthReport.set(date, monthReport.get(date)+1);
      }
    });

    company.totalRecords = company.records.length;
    company.monthlyReport = monthReport;

    const reportName = getReportName(company);
    const reportPath = path.join('data', 'reports', reportName);

    const pdfReport = generateReport(new PDFDocument(), company);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + reportName + '"'
    );

    pdfReport.pipe(fs.createWriteStream(reportPath));
    pdfReport.pipe(res);

  } catch (err) {
    next(err);
  }
}

exports.getAddCompany = async (req, res, next) => {
  res.render('add-company', {
    pageTitle: 'Add Company'
  })
}

exports.postAddCompany = async (req, res, next) => {
  let { companyName, startAt, endAt, contactName, contactPhone, contactEmail } = req.body;

  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, HttpStatus.BAD_REQUEST, errors, 'Bad request');
  }

  // handle input error later
  if (companyName === "" || startAt === "" || contactName === "") {
    return res.status(422).render('add-company', {
      pageTitle: 'Add Company'
    })
  }
  
  endAt = endAt === "" ? null : new Date(endAt);
  contactPhone = contactPhone == "" ? null : contactPhone
  contactEmail = contactEmail == "" ? null : contactEmail

  const company = new Company({
    companyName: companyName,
    contactName: contactName,
    contactPhone: contactPhone,
    contactEmail: contactEmail,
    startDate: new Date(startAt),
    endDate: endAt
  })

  try {
    await company.save();
    const redirectLink = `/from/${company._id}`;
    company.redirectLink = redirectLink
    await company.save();

    res.redirect(`/admin/generate-qr-code/${company._id}`);
  
  } catch (err) {
    console.log(err);
  }
  
}

exports.getCompanyQR = async (req, res, next) => {
  try {
    const companyId = req.params.companyId;
    const company = await Company.findById(companyId);
    if (!company) { sendError(res, HttpStatus.NOT_FOUND, 'URL Not Found!', ''); }
    
    const qrHTML = await otherHelper.generateQRCode(company._id);
    res.send(qrHTML);

  } catch (err) {
    next(err);
  } 
}

exports.postUploadQR = async (req, res, next) => {
  const { companyId } = req.body;
  const image = req.file;
  if (!image) { 
    return sendError(res, HttpStatus.BAD_REQUEST, 'Please upload Images', '') 
  }

  try {
    const company = await Company.findById(companyId.trim());
    const imageUrl = image.path;
    company.qrImg = imageUrl;
    await company.save();
    res.redirect('/admin/all-visits');

  } catch (err) {
    next(err);
  }
  
}

