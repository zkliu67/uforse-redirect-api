const Company = require('../models/company');

exports.getCompany = async (req, res, next) => {
  try {
    const companies = await Company.find();

    // count the total records of a company and monthly records
    const recordsOfCompanies = companies.map(company => {
      var record = company.records.filter(
        record => record.enterAt.getMonth() === new Date().getMonth()
      )

      return { 
        ...company,
        totalRecords: company.records.length,
        monthlyRecords: record.length
      }

    })

    res.status(200).json({
      totalRecords: recordsOfCompanies
    })
    // res.render('company-list', {
    //   pageTitle: 'Company-List'
    // })
  } catch (err) {
    console.log(err);
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
