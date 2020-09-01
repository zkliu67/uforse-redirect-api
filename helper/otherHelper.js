const schedule = require('node-schedule');
const axios = require('axios');

const moment = require('moment');
const Company = require('../models/company');

const otherHelper = {};

otherHelper.checkCompanyValidation = schedule.scheduleJob('*/5 * * * * *', function() {
  const date = moment(new Date()).format('YYYY-MM-DD');

  Company.find()
    .then(companies => {
      companies.forEach(company => {
        if (company.endDate) {
          const endDate = moment(company.endDate).format('YYYY-MM-DD');
          if (date >= endDate) {
            console.log('large')
            company.isValid = false;
            return company.save()
              .then(res => console.log('updated'))
              .catch(err => {throw(err)})
          }
        }
      })
    })
    .catch(err => {throw(err)})
});

otherHelper.generateQRCode = async () => {
  try {
    return await axios.get('https://cli.im/api/qrcode/code?text=//cli.im&mhid=sELPDFnok80gPHovKdI')

  } catch (err) {
    throw (err);
  }
}

// autoHelper.autoTester = schedule.scheduleJob( '*/1 * * * * *', function() {
//   console.log('auto task every second');
// });


module.exports = otherHelper;