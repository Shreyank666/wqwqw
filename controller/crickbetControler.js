const Bet2 = require('../models/crickbetModel');
const User_Wallet = require('../models/Wallet'); 
const User = require('../models/UserSignUp');  
const mongoose = require('mongoose');


exports.placeBet = async (req, res) => {
  try {
    const { label, odds, stake, profit, userId,type,run,match } = req.body;
    // console.log(req.body)
    // Validate input
    if (!label || !odds || !stake || !profit || !userId || stake <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: all bet details are required and stake must be greater than 0',
      });
    }
    const userWallet = await User_Wallet.findOne({ user: userId });
    if (!userWallet) {
      // console.error("Wallet not found for user:", userId);
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    // console.log("User wallet found:", userWallet);
    if (userWallet.balance < stake) {
      console.error("Insufficient balance. Current balance:", userWallet.balance, "Stake:", stake);
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    userWallet.balance -= stake;

    await userWallet.save();
    // console.log("Updated wallet balance:", userWallet.balance);
    const newBet = new Bet2({
      user: userId, 
      label,
      odds,
      run,
      stake,
      profit,
      type,
      match,
    });

    // Save the bet
    const savedBet = await newBet.save();
    // console.log("Bet saved successfully:", savedBet);

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet: savedBet,
      updatedWallet: userWallet.balance,
    });
  } catch (err) {
    console.error('Error placing bet:', err);
    res.status(500).json({ success: false, message: 'Error placing bet', error: err.message });
  }
};




exports.getUserBets = async (req, res) => {
  const { userId } = req.params; 
 
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }
    const bets = await Bet2.find({ user: new mongoose.Types.ObjectId(userId) });
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
};



exports.updateWallet = async (req, res) => {
  const { userId, amount } = req.body;

  try {
      // Find the user by ID
      const userWallet = await User_Wallet.findOne({ user: userId });
      if (!userWallet) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      // Update the wallet balance
      userWallet.balance += amount;
      await userWallet.save();

      res.json({ success: true, message: "Wallet updated successfully", walletBalance: userWallet.balance});
  } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};

const bcrypt = require("bcryptjs"); 


exports.adminusersignup = async (req, res) => {
 
  try {
    const { username, email, password, balance } = req.body;

    if (!username || !email || !password || balance === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save user first
    const savedUser = await newUser.save();

    // Create wallet for the user
    const wallet = new User_Wallet({
      user: savedUser._id,
      balance: balance, // Store initial balance
    });

    const savedWallet = await wallet.save();

    // Link wallet to user
    savedUser.wallet = savedWallet._id;
    await savedUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        balance: savedWallet.balance,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.allbetsupdate = async (req, res) => {
  try {
   

    // Fetch all bets with required fields
    const allBets = await Bet2.find().select("label odds stake profit type createdAt result match");

    console.log("Fetched Bets:", allBets.length);
    
    res.status(200).json({ success: true, data: allBets });
  } catch (error) {
    console.error("Error fetching bets:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateResultUserBet = async (req, res) => {
  const { label, result } = req.body; // Get label and result from frontend

  try {
    // Find all pending bets where label matches
    const betsToUpdate = await Bet2.find({ 
      label, 
      status: "Pending" 
    });

    if (betsToUpdate.length === 0) {
      return res.status(404).json({ success: false, message: "No matching bets found" });
    }



    // Loop through each bet and conditionally update wallet or status
    for (let bet of betsToUpdate) {
      if (bet.type === "YES" && bet.run <= result) {
        // If type is "YES" and run >= result, update only the status
        const userWallet = await User_Wallet.findOne({ user: bet.user });

        if (userWallet) {
          // Add the profit to the current balance
          userWallet.balance += bet.profit;

          // Save the updated wallet balance
          await userWallet.save();
        }

        await Bet2.findByIdAndUpdate(bet._id, { status: "Win" ,result: result  });
      } else if (bet.type === "NO" && bet.run > result) {
        // If type is "NO" and run < result, update wallet with profit
        const userWallet = await User_Wallet.findOne({ user: bet.user });

        if (userWallet) {
          // Add the profit to the current balance
          userWallet.balance += bet.profit;

          // Save the updated wallet balance
          await userWallet.save();
        }

        // Update the bet status to "Completed"
        await Bet2.findByIdAndUpdate(bet._id, { status: "Win" ,result: result  });
      } else if(bet.type === "khaai" && bet.type == result){
        const userWallet = await User_Wallet.findOne({ user: bet.user });

        if (userWallet) {
          // Add the profit to the current balance
          userWallet.balance += bet.profit;

          // Save the updated wallet balance
          await userWallet.save();
        }

        // Update the bet status to "Completed"
        await Bet2.findByIdAndUpdate(bet._id, { status: "Win" ,result: result  });

      }else if(bet.type === "Lgaai" && bet.type ==result){
        const userWallet = await User_Wallet.findOne({ user: bet.user });

        if (userWallet) {
          // Add the profit to the current balance
          userWallet.balance += bet.profit;

          // Save the updated wallet balance
          await userWallet.save();
        }

        // Update the bet status to "Completed"
        await Bet2.findByIdAndUpdate(bet._id, { status: "Win" ,result: result  });

      } else {
        // If conditions are not satisfied, just update the bet status
        await Bet2.findByIdAndUpdate(bet._id, { status: "Loss", result: result  });
      }
    }

    res.json({ success: true, message: "Profit added to wallet successfully" });

  } catch (error) {
    console.error("Error updating bets:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

