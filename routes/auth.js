const express = require('express');
const {register,login , getMe,forgotPassword,resetPassword,updateDetalis,updatePassword, logout} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
    


const router = express.Router();
router.post('/register',register)
.post('/login',login);

router.get('/me',protect,getMe);
router.post('/forgotpassword',forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword)
router.put('/updatedetalis',protect,updateDetalis);
router.put('/updatepassword',protect,updatePassword);
router.get('/logout',logout);
module.exports = router;

