const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
  companyName: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String
  },
  contactEmail: {
    type: String
  },
  contactAddress: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  redirectLink: {
    type: String
  },
  isValid: {
    type: Boolean, 
    required: true,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);