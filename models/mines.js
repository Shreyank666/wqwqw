const mongoose = require('mongoose');

const minesSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        betAmt: { type: Number },
        winningAmt: { type: Number },
        lossAmt: { type: Number },
        isWin: { type: String, default: "" },
        balanceAfterGame: { type: Number, required: true },

    },
    { timestamps: true }
);

const Mines = mongoose.model('Mine', minesSchema);
module.exports = Mines;