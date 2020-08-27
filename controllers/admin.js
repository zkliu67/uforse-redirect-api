const fs = require('fs');
const path = require('path');
const moment = require('moment');
const PDFDocument = require('pdfkit');

const { sendError } = require('../helper/errorHelper');
const { generateReport, getReportName } = require('../helper/reportHelper');
const { sendMail } = require('../helper/emailHelper');

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

exports.getCompaniesReport = async (req, res, next) => {
  try {
    const companies = await Company.find();
    
    let totalRecord = 0;
    companies.map(company => {
      return totalRecord += company.records.length
    });

    let recordMap = new Map();
    companies.map(company => {
      const companyName = company.companyName;
      
      company.records.map(record => {
        let month = record.enterAt.getMonth() + 1;
        month = month < 10 ? '0'+month : month;
        const year = record.enterAt.getFullYear();
        const date = `${year}-${month}`.toString();

        if (!recordMap.has(date)) {
          const montlyReport = new Map([[companyName, 1]]);
          recordMap.set(date, montlyReport);
        } else {
          const monthlyReport = recordMap.get(date);
          if (!monthlyReport.has(companyName)) {
            monthlyReport.set(companyName, 1);
          } else {
            monthlyReport.set(companyName, monthlyReport.get(companyName)+1);
          }
          recordMap.set(date, monthlyReport);
        }
      })
    });

    console.log(recordMap);
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

exports.postEmailReport = (req, res, next) => {
  sendMail("Nodemailer test", "succeed");
  res.redirect('/admin/all-companies');
}
