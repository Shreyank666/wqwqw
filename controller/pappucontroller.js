const Papu = require('../models/papuModel');
const User_Wallet = require('../models/Wallet');
const User = require("../models/UserSignUp");
const { default: mongoose } = require('mongoose');
const papuModel = require('../models/papuModel');
// Create a new bet
// exports.createBet = async (req, res) => {
//   try {
//     console.log("ok")
//     const { user, betAmount, profit, isWin } = req.body;
//     console.log(req.body)
//     console.log(User, "user")
//     // if (user || !betAmount || !profit) {
//     //   return res.status(400).json({ message: 'All fields are required' });
//     // }
//     const Wallet = await User_Wallet.findOne({ user: user });
//     console.log(Wallet, "wallet")
//     const User = await User.findOne({ _id: user });
//     // console.log(User, "user")
//     if(isWin == true){
//       Wallet.balance += profit; 
//       await Wallet.save();
//     }else{
//       Wallet.balance -= profit;
//       await Wallet.save();
//     }
//     const newBet = new Papu({ user, betAmount, profit });
//     await newBet.save();
//     res.status(201).json(newBet);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// Create a new bet and update wallet balance
exports.createBet = async (req, res) => {
    try {
        console.log("Bet API Called");
        const { user, betAmount, profit, isWin, totalBets } = req.body;

        console.log("Request Body:", req.body);

        // Check if user exists
        const wallet = await User_Wallet.findOne({ user });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        console.log("User Wallet:", wallet);

        // Update wallet balance
        if (isWin) {
            // profit += profit;
            wallet.balance += (profit - totalBets);  // Add winnings
        } else {
            wallet.balance -= totalBets;  // Deduct bet amount (loss)
        }

        await wallet.save();

        // Save bet details
        const newBet = new Papu({ user, betAmount, profit:profit - totalBets, isWin, totalBets });
        await newBet.save();

        res.status(201).json({
            message: isWin ? "Bet won!" : "Bet lost.",
            newBet,
            newBalance: wallet.balance  // Send updated balance
        });

    } catch (error) {
        console.error("Error in createBet:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getBetByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }
        const bets = await papuModel.find({ user: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
        if (!bets || bets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bets found for this user',
            });
        }
        res.status(200).json({
            success: true,
            bets,
        });
    } catch (err) {
        console.error('Error fetching bets:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching bets',
        });
    }
}

// Get all bets
exports.getBets = async (req, res) => {
    try {
        const bets = await Papu.find().populate('user', 'name email');
        res.status(200).json(bets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get a single bet by ID
exports.getBetById = async (req, res) => {
    try {
        const bet = await Papu.findById(req.params.id).populate('user', 'name email');
        if (!bet) return res.status(404).json({ message: 'Bet not found' });
        res.status(200).json(bet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update bet winnings
exports.updateWinnings = async (req, res) => {
    try {
        const { totalWinnings } = req.body;
        const bet = await Papu.findByIdAndUpdate(req.params.id, { totalWinnings }, { new: true });
        if (!bet) return res.status(404).json({ message: 'Bet not found' });
        res.status(200).json(bet);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a bet
exports.deleteBet = async (req, res) => {
    try {
        const bet = await Papu.findByIdAndDelete(req.params.id);
        if (!bet) return res.status(404).json({ message: 'Bet not found' });
        res.status(200).json({ message: 'Bet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.getBets = async (req, res) => {
    try {
        const bets = await Papu.find().populate('user', 'username');
        res.status(200).json(bets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
