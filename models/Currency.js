const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema(
  {
    id: Number,
    rates: [],
    date: Date,
  },
  { versionKey: false },
);

const Currency = mongoose.model('Currency', CurrencySchema);

module.exports = Currency;
