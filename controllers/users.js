const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const advancedResults = require('../middleware/advancedResults');

const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/async');


// @desc        Get all Users
// @route       GET /api/v1/auth/users
// @access      Private/Admin

exports.getUsers = asyncHandler(async(req,res,next)=>{

res.status(200).json(res.advancedResults);

});



// @desc        Get Single User
// @route       GET /api/v1/auth/users/:id
// @access      Private/Admin

exports.getUser = asyncHandler(async(req,res,next)=>{

    const user = await User.findById(req.params.id);
    res.status(200).json({
        success:true,
        data:user
    });     
    });
    

// @desc        Create a User
// @route       POST /api/v1/auth/users/
// @access      Private/Admin

exports.createUser = asyncHandler(async(req,res,next)=>{

    // we are getting a user from the req.body

    const user = await User.create(req.body);
    res.status(201).json({
        success:true,
        data:user
    });     
    });
    



// @desc        Update a User
// @route       PUT /api/v1/auth/users/:id
// @access      Private/Admin

exports.updateUser = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
            return next(new ErrorResponse('Invalid user id',404));
    }
    // the admin is trying to update the user's password
    if (req.body.password){
            user.password  = req.body.password;
            delete req.body.password;

    }
    Object.keys(req.body).forEach((key)=>{
        user[key] = req.body[key];
    });

    await user.save();
    user.password = undefined;
    res.status(200).json({
        success:true,
        data:user
    });


});



// @desc        Delete User
// @route       DELETE /api/v1/auth/users/:id
// @access      Private/Admin

exports.deleteUser = asyncHandler(async(req,res,next)=>{
    const user = await User.findByIdAndDelete(req.params.id);
    
    res.status(201).json({
        success:true,
        data:{}
    });     
    });