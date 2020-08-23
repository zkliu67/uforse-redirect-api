const fs = require('fs');
const path = require('path');
const moment = require('moment');

const PDFDocument = require('pdfkit');

const { sendError } = require('../helper/errorHelper');
const { generateReport } = require('../helper/reportHelper');
const HttpStatus = require('http-status');

const Company = require('../models/company');

exports.getCompany = async (req, res, next) => {
  try {
    const companies = await Company.find();
    // count the total records of a company and monthly records
    const recordsOfCompanies = companies.map(company => {
      var record = company.records.filter(
        record => record.enterAt.getMonth() === new Date().getMonth()
      )
      company.totalRecords = company.records.length;
      company.monthlyRecords = record.length
      return company;
    });

    // console.log(Object.keys(recordsOfCompanies[0]));

    // res.status(200).json({
    //   totalRecords: recordsOfCompanies
    // })
    res.render('company-list', {
      pageTitle: 'Company-List',
      companies: recordsOfCompanies,
      moment: moment
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
    company.totalRecords = company.records.length;
    generateReport(res, new PDFDocument, company);

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
  const { companyName, startAt } = req.body;
  let endAt = req.body.endAt;

  // handle input error later
  if (companyName === "" || startAt === "") {
    return res.status(422).render('add-company', {
      pageTitle: 'Add Company'
    })
  }
  
  endAt = endAt === "" ? null : new Date(endAt);

  const company = new Company({
    companyName: companyName,
    startDate: new Date(startAt),
    endDate: endAt
  })

  try {
    await company.save();
    res.redirect('/admin/all-companies');
  
  } catch (err) {
    console.log(err);
  }
  
}
