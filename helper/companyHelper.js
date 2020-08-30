const moment = require('moment');

const companyHelper = {};

companyHelper.getDailyRecords = (company) => {
  var dateArray = [];
  var countArray = [];

  company.records.forEach(record => {
    const date = moment(record.enterAt).format('YYYY-MM-DD');
    if (dateArray.includes(date)) {
      countArray[dateArray.indexOf(date)] += 1;
    }
    else {
      dateArray.push(date);
      countArray[dateArray.indexOf(date)] = 1;
    }
  });

  return { dateArray: dateArray, countArray: countArray };
}

companyHelper.getCompanyDailyRecords = company => {
  const { dateArray, countArray } = companyHelper.getDailyRecords(company);
  const recordsArray = dateArray.map((date, index) => {
    return {
      companyName: company.companyName,
      date: date,
      count: countArray[index]
    };
  })
  return recordsArray;
}

companyHelper.getCompaniesTotalRecords = companies => {
  const totalRecords = companies.map(company => {
    return companyHelper.getCompanyDailyRecords(company);
  });

  const recordMap = new Map();
  

  console.log(totalRecords);
}

module.exports = companyHelper;