const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
  companyName: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  records: [{
    isSucceed: {
      type: Boolean, 
      required: true
    },
    enterAt: {
      type: Date,
      required: true
    }
  }],
  isValid: {
    type: Boolean, 
    required: true,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);