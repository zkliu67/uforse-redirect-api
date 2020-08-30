const moment = require('moment');

const Visit = require('../models/vist');
const Company = require('../models/company');
const { sendError } = require('./errorHelper');

const visitHelper = {};

visitHelper.visitsAllCompanies = async () => {
  try {
    const aggregateSummary = await Visit.aggregate([
      { $group: { _id: { company: "$companyId" }, totalVisits: { $sum: 1 }} }
    ]);

    return await Promise.all(aggregateSummary.map( async ({ _id, totalVisits }) => {
      const company = await Company.findById(_id.company)
      return {
        company: company,
        totalVisits: totalVisits
      }
    }))

  } catch (err) {
    throw (err);
  }
}

visitHelper.CompaniesVisitsDaily = async () => {
  try {
    const summary = await Visit.aggregate([
      { $lookup: {
        from: "companies",
        localField: "companyId",
        foreignField: "_id",
        as: "company_docs"
      }},
      { $project: {
        companyId: 1,
        'company_docs.companyName': 1,
        formatVisitDate: {
          $dateToString: {
            format: '%Y-%m-%d', date: '$visitAt'
          }
        }
      }},
      { $group: { 
        _id: { 
          company: "$company_docs.companyName",
          formatVisitDate: "$formatVisitDate"
        }, 
        totalVisits: { $sum: 1 }
      }}, 
      { $group: {
        _id: '$_id.formatVisitDate',
        companies: {
          $push: {
            company: '$_id.company',
            total: '$totalVisits'
          }
        }
      }},
      { $sort: { '_id.formatVisitDate': -1 }}
    ]);

    const map = summary.map(res => {
      const visitMap = new Map();
      let dailyTotal = 0;
      res.companies.map(company => {
        visitMap[company.company[0]] = company.total
        dailyTotal += +company.total;
      });
      return {
        date: res._id,
        dailyVisits: visitMap,
        dailyTotal: dailyTotal
      };
    });
    
    return map.sort(compareDate);

  } catch (err) {
    throw (err);
  }
}

visitHelper.visitCompany = async (company) => {
  try {
    const visits = await Visit.find({'companyId': company});

  } catch (err) {
    throw (err);
  }
}

const compareDate = (v1, v2) => {
  const d1 = v1.date;
  const d2 = v2.date;

  let comparison = 0;
  if (d1 < d2) { comparison = 1 }
  else if (d1 > d2) { comparison = -1 }
  return comparison;
}

module.exports = visitHelper;