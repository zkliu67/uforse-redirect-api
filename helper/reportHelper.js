const fs = require('fs');
const path = require('path');

exports.generateReport = (pdfDoc, company) => {

  generateHeader(pdfDoc);
  generateCompanyInfo(pdfDoc, company);
  generateReportTable(pdfDoc, company.monthlyReport);
  generateFooter(pdfDoc);
  
  pdfDoc.end();
  return pdfDoc;
}

exports.getReportName = (company) => {
  const date = new Date();
  let month = date.getMonth() + 1;
  month = month < 10 ? '0'+month : month;
  const year = date.getFullYear();

  return 'Report-' + 
  company.companyName + '-'+ 
  month + '-' + year + '.pdf';
}

function generateCompanyInfo(doc, company) {
  doc
    .text(`Company Name: ${company.companyName}`, 50, 100)
    .text(`Start At: ${company.startDate.toDateString()}`, 50, 115)
    .text(`End At: ${company.endDate}`, 50, 130)
    .text(`total Records: ${company.totalRecords}`, 50, 150)
    .moveDown()
}

function generateHeader(doc) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Uforse Inc.", 50, 57)
    .fontSize(10)
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("Toronto, On, CA", 200, 80, { align: "right" })
}

function generateReportTable(doc, monthlyReport) {
  let i = 0,
    reportTableTop = 165;
  
  monthlyReport.forEach((value, key) => {
    const recordTop = reportTableTop + 15*i;
    i++;
    doc
      .text(key, 50, recordTop)
      .text(value, 150, recordTop)
      .moveDown()
  })
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      700,
      { align: "center", width: 500 }
    );
}

