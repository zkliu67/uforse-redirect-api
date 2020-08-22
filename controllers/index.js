const Company = require('../models/company');

exports.jumpTo = async (req, res, next) => {
  const companyId = req.params.companyId;
  // 5f3f4f599f3f48099f72f408
  try {
    const company = await Company.findById(companyId);

    if (company != null && company.isValid) {
      // return res.status(200).json({
      //   company: company
      // })
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
      return res.status(404).json({
        message: "invalid company."
      });
    }

  } catch (err) {
    // invalid object id
    return res.status(500).json({
      message: err 
    })
  }

}