const fs = require('fs');
const path = require('path');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');

const { sendError } = require('../helper/errorHelper');
const { generateReport, getReportName } = require('../helper/reportHelper');
const { sendMail } = require('../helper/emailHelper');
const companyHelper = require('../helper/companyHelper');
const visitHelper = require('../helper/visitHelper');

const HttpStatus = require('http-status');

const Company = require('../models/company');
const Visit = require('../models/vist');

exports.getCompanies = async (req, res, next) => {
  try {
    const allVisits = await visitHelper.visitsAllCompanies();
    res.render('company-list', {
      pageTitle: 'Company-List',
      allVisits: allVisits,
      moment: moment
    })
  } catch (err) {
    next(err);
  }
}

exports.getCompany = async (req, res, next) => {
  const companyId = req.params.companyId;
  try {
    const company = await Company.findById(companyId);
    if (company == null) {
      return sendError(res, HttpStatus.NOT_FOUND, null, 'Not found.');
    }
    const { dateArray, countArray } = companyHelper.getDailyRecords(company);

    res.render('company', {
      pageTitle: 'detail',
      company: company,
      dateArray: dateArray,
      countArray: countArray
    })

  } catch(err) {
    next(err)
  }
}

exports.getCompaniesReport = async (req, res, next) => {
  try {
    const dailyCompanyVisits = await visitHelper.CompaniesVisitsDaily();
    const companies = await Company.find();
    const visits = await Visit.find()
    // res.status(200).json({
    //   dailyCompanyVisits: dailyCompanyVisits,
    //   companies: companies
    // })
    res.render('total-companies-records', {
      pageTitle: 'Daily Visits',
      companies: companies,
      dailyCompanyVisits: dailyCompanyVisits,
      totalVisits: visits
    })
  } catch (err) {
    next(err);
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

    res.redirect('/admin/all-companies');
  
  } catch (err) {
    console.log(err);
  }
  
}

exports.postEmailReport = (req, res, next) => {
  sendMail("Nodemailer test", "succeed");
  res.redirect('/admin/all-companies');
}
