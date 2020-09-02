const schedule = require('node-schedule');
const axios = require('axios');

const moment = require('moment');
const Company = require('../models/company');

const otherHelper = {};

otherHelper.checkCompanyValidation = schedule.scheduleJob({hour: 00, minute: 00}, function() {
  const date = moment(new Date()).format('YYYY-MM-DD');

  Company.find()
    .then(companies => {
      companies.forEach(company => {
        if (company.endDate) {
          const endDate = moment(company.endDate).format('YYYY-MM-DD');
          if (date > endDate) {
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

otherHelper.generateQRCode = async (companyId) => {
  try {
    const response = await axios({
      "method":"POST", 
      "url":`https://cli.im/api/qrcode/code?text=http%3A%2F%2Fuforse-redirect-api.herokuapp.com%2Ffrom%${companyId}&mhid=sELPDFnok80gPHovKdI`
    })
    return response.data;
  } catch (err) {
    throw (err);
  }
}

// autoHelper.autoTester = schedule.scheduleJob( '*/1 * * * * *', function() {
//   console.log('auto task every second');
// });


module.exports = otherHelper;