const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

// @desc        Register user
// @route       POSt /api/v1/auth/register
// @access      Public

exports.register = asyncHandler(async(req,res,next)=>{
         
    const {name,email,password,role} = req.body;
    const user = await User.create({
        name , email , password,role
    });

        // create the token
        sendTokenResponse(user,200,res);    

});


// @desc        Login user
// @route       POSt /api/v1/auth/login
// @access      Public

exports.login = asyncHandler(async(req,res,next)=>{
         
    const {email,password} = req.body;
    // lets check if the user exist or no
        if (!email || !password){
            return next(new ErrorResponse("Please provide an email and a password",400));
        }

        const user = await User.findOne({email}).select("+password");
        // the user is not exist 
        if (!user){
            return next(new ErrorResponse("Invalid credentials ",401));
        }

        // lets check if the password is matching with the one in db
        const isMatch = await user.matchPassword(password);
        if (!isMatch){
            return next(new ErrorResponse("Please enter correct password",401));
        }

   sendTokenResponse(user,200,res);    
});



// @desc        GEt current logged in user
// @route       GET/api/v1/auth/me
// @access      Priavte

exports.getMe = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    });

});





// @desc        Log user out / clear cookie
// @route       POSt /api/v1/auth/logout
// @access      Priavte

exports.logout = asyncHandler(async(req,res,next)=>{
   res.cookie('token','none',{
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly:true
   });
    res.status(200).json({
        success:true,
        data:{}
    });

});
// @desc        Forgot Password
// @route       POSt /api/v1/auth/forgotpassword
// @access      Public

exports.forgotPassword = asyncHandler(async(req,res,next)=>{

    // we need to get the email from the req
    const user = await User.findOne({
        email:req.body.email
    });

    // lets see if it's exist or not

    if (!user){
        return next(new ErrorResponse(`No user with this email`,404));
    }

    // if it exist ?
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);

    await user.save({validateBeforeSave:false});

    // create reset url

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receving this email because you or someone else
     has requested the reset of the password. Please make a Put request to:
        \n\n ${resetUrl}
    `;

        try{
                await sendEmail({
                    email:user.email,
                    subject:'Password reset token',
                    message:message
                });
                res.status(200).json({
                    success:true,
                    data:'Email Sent'
                });
        }catch(err){
                console.log(err);
               user.resetPasswordToken=undefined;
                user.resetPasswordExpire=undefined;
                await user.save({
                    validateBeforeSave:false
                });
                return next(new ErrorResponse('Email could not be sent' , 500));
        }
   
});



// @desc        Reset Password
// @route       PUT /api/v1/auth/resetpassword/:resettoken  
// @access      Public

exports.resetPassword = asyncHandler(async(req,res,next)=>{

// lets hash the token from the request
    const resetPasswordToken
    = crypto.createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt : Date.now()
        }
    });

    if (!user){
        return next(new ErrorResponse('Invalid Token',400));
    }

    // otherwise the token is valid and not expired

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire=undefined;

    await user.save();
    sendTokenResponse(user,200,res)
});

// @desc        GEt current logged in user
// @route       PUT /api/v1/auth/me
// @access      Priavte (Require the user to be logged in)
 /*
   {
    "currentPassword":"XXX-AAA-ZZZZ",
    "newPassword":"XXXXXXXXXXXXXX"
    }
    */

exports.updatePassword = asyncHandler(async(req,res,next)=>{
   
    // we need to get the current password and the new password

    const user = await User.findById(req.user.id).select('+password');
    // now im getting the user id and the pw for this user 
    // ofc the password is hashed 

    const isMatch = await user.matchPassword(req.body.currentPassword);
    
    if (!isMatch){
        return next(new ErrorResponse('Current password is incorrect',401));
    }

    // if they matching now lets update with the new password
    // set the new one
    user.password = req.body.newPassword;

    // save the user in db
    await user.save();

  sendTokenResponse(user,200,res);

});




// @desc        Update user details
// @route       PUT /api/v1/auth/updatedetails
// @access      Priavte

exports.updateDetalis = asyncHandler(async(req,res,next)=>{
   const fieldsToUpdate = {
    name:req.body.name,
    email:req.body.email
   }

   
    const user = await User.findByIdAndUpdate( req.user.id,fieldsToUpdate,
        {
            new:true,
            runValidators:true
        }
    ); 
    res.status(200).json({
        success:true,
        data:user
    });

});

//  Get token from model , create cookie and send response 
const sendTokenResponse = (user,statusCode,res)=>{
    const token = user.getSignedJwtToken();
    const options = {
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly:true  
    };
    res
    .status(statusCode)
    .cookie('token',token,options)
    .json({
        success:true,
        token
    });
if (process.env.NODE_ENV ==='production'){
    options.secure = true;
}
}