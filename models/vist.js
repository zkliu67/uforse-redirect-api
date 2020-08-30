const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitSchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  visitAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Visit', visitSchema);