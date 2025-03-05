const mongoose = require('mongoose');
const papuSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  betAmount: { type: Number },
  totalBets: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  isWin: { type: Boolean, default: false },
}, { timestamps: true });


const papuModel = mongoose.model('papu', papuSchema);
module.exports = papuModel;