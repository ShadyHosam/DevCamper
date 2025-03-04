const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Courses');
const Bootcamp = require('../models/Bootcamp');
// @desc        Get all Courses
// @route       GET  /api/v1/courses/bootcampId/courses
// @route       GET /api/v1/courses
// @access      Public


exports.getCourses = asyncHandler(async(req,res,next)=>{
    let query;
    if (req.params.bootcampId){
        // no need to make it await because we are building the query
        // lets get the course that related to this id 

        query  = Course.find({bootcamp:req.params.bootcampId});
    }else{
            query = Course.find().populate({
                path:'bootcamp',
                select:'name description'
            });
    }
    const courses = await query;
    res.status(200).json({
        success:true,
        count:courses.length,
        data:courses
    })
});


// @desc        Get Single Course
// @route       GET /api/v1/courses/:id
// @access      Public


exports.getCourse = asyncHandler(async(req,res,next)=>{
  
    const course = await Course.findById(req.params.id).populate({
        path:'bootcamp',
        select:'name description'
    });
    if(!course){
        return next(new ErrorResponse(`No Course with the id of ${req.params.id}`),404)
    }
    res.status(200).json({
        success:true,
        count:course.length,
        data:course 
    })
});

// @desc        Add a Course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Public


exports.addCourse = asyncHandler(async(req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId;



    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next(new ErrorResponse(`No Bootcamp with the id of ${req.params.bootcampId}`),404);
    }

    const course = await Course.create(req.body);
    res.status(200).json({
       success :true,
       data:course
    })
});


// @desc        Update a Course
// @route       PUT /api/v1/courses/:id
// @access      Public


exports.updateCourse = asyncHandler(async(req,res,next)=>{
        let course = await Course.findById(req.params.id);
        if (!course){
            return next(
                new ErrorResponse(`This Course with id ${req.params.id} is not exist!`,404)
            );
        }
        course = await Course.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true
        });

        return res.status(200).json({
            success:true,
            data:course 
        });


});

// @desc        Delete Course
// @route       DELETE /api/v1/courses/:id
// @access      Public


exports.deleteCourse = asyncHandler(async(req,res,next)=>{
    let course = await Course.findById(req.params.id);
    if (!course){
        return next(
            new ErrorResponse(`This Course with id ${req.params.id} is not exist!`,404)
        );
    }
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true,
        data:{}
    });
});