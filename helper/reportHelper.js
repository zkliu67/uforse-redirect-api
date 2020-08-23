const fs = require('fs');
const path = require('path');

exports.generateReport = (res, pdfDoc, company) => {
  const reportName = getReportName(company);
  const reportPath = path.join('data', 'reports', reportName);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + reportName + '"'
  );

  generateHeader(pdfDoc);
  generateCompanyInfo(pdfDoc, company);
  generateReportTable(pdfDoc, company);
  generateFooter(pdfDoc);
  
  pdfDoc.end();

  pdfDoc.pipe(fs.createWriteStream(reportPath));
  pdfDoc.pipe(res);

}

function getReportName(company) {
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

function generateReportTable(doc, company) {
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

