const express = require('express');
const router = express.Router();
const crickbetControler = require('../controller/crickbetControler');

// Define routes
router.post('/api/bets', crickbetControler.placeBet);
router.get('/api/bets/:userId', crickbetControler.getUserBets);
router.post('/wallet/update',crickbetControler.updateWallet);

// router.delete('/api/bets', betController.resetBets);
router.post('/api/admin/signup',crickbetControler.adminusersignup);
router.get('/api/admin/cricketmarket/allbetsupdate',crickbetControler.allbetsupdate);
router.put('/api/admin/updateResultUserBet',crickbetControler.updateResultUserBet);
module.exports = router;
