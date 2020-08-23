const Company = require('../models/company');
const { sendError } = require('../helper/errorHelper');
const HttpStatus = require('http-status');

exports.jumpTo = async (req, res, next) => {
  const companyId = req.params.companyId;
  // 5f3f4f599f3f48099f72f408
  try {
    const company = await Company.findById(companyId);

    if (company != null && company.isValid) {
      const record = {
        isSucceed: true,
        enterAt: new Date()
      };

      company.records.push(record);
      await company.save();
      // return res.redirect('/admin/all-companies')
      return res.redirect('https://www.uforse.com')
    }
    else {
      sendError(res, HttpStatus.UNAUTHORIZED, null, 'Invalid company');
    }

  } catch (err) {
    next(err);
  }

}