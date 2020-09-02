const fs = require('fs');
const path = require('path');

reportHelper = {};

reportHelper.generateReport = (pdfDoc, companies, dailyVisits) => {

  generateHeader(pdfDoc);
  generateTableHeader(pdfDoc, companies)
  generateReportTable(pdfDoc, companies, dailyVisits);
  generateFooter(pdfDoc);
  
  pdfDoc.end();
  return pdfDoc;
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
    .text("Uforse Education Inc.", 50, 57)
    .fontSize(10)
    // .text("123 Main Street", 200, 65, { align: "right" })
    // .text("Toronto, On, CA", 200, 80, { align: "right" })
}

function generateTableHeader(doc, companies) {
  const cellWidth = (doc.page.width / (companies.length + 2)) >> 0;
  const widthProp = { width: cellWidth, align: "left" };
  let marginStart = 50;

  doc
    .fontSize(12)
    .text("Date", marginStart, 90, widthProp)
  
    companies.forEach(company => {
    marginStart += cellWidth;
    doc
      .text(company, marginStart, 90, widthProp)
      .stroke()
  });
  
  marginStart += cellWidth;
  doc.text("total", marginStart, 90, widthProp)
}

function generateTableRow(doc, height, dailyVisit, companies) {
  const cellWidth = (doc.page.width / (companies.length + 2)) >> 0;
  const widthProp = { width: cellWidth, align: "left" };
  let marginStart = 50;

  doc
    .fontSize(10)
    .text(dailyVisit.date, marginStart, height, widthProp)

  companies.forEach(company => {
      count = dailyVisit.dailyVisits[company] ? dailyVisit.dailyVisits[company] : 0
      marginStart += cellWidth
      doc.text(count, marginStart, height, widthProp)
    })
  doc
    .text(dailyVisit.dailyTotal, marginStart + cellWidth, height, widthProp)

}

function generateReportTable(doc, companies, dailyVisits) {
  let totalVisits = 0,
    reportTableTop = 120;
  dailyVisits.forEach((dailyVisit, index) => {
    generateTableRow(doc, reportTableTop, dailyVisit, companies);
    reportTableTop += 30;
    totalVisits += dailyVisit.dailyTotal;
  })  

  doc
    .fontSize(13)
    .text(`Total: ${totalVisits}`,50 ,reportTableTop, {align: "left"})
}

function generateFooter(doc) {
  doc
    .fontSize(8)
    .text(
      "UFORSE EDUCATION INC 2020.",
      50,
      700,
      { align: "center", width: 500 }
    );
}

module.exports = reportHelper;

