const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Courses');
const advancedResults = require('../middleware/advancedResults');
// @desc        Get all Courses
// @route       GET  /api/v1/courses/bootcampId/courses
// @route       GET /api/v1/courses
// @access      Public


exports.getCourses = asyncHandler(async(req,res,next)=>{

    if (req.params.bootcampId){
        const courses = await Course.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success:true,
            count:courses.length,
            data:courses
        });
    }else{
           res.status(200).json(res.advancedResults);
    }
   
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
    
    console.log("-------------------------------");
    
    console.log(req.body);
    req.body.bootcamp = req.params.bootcampId;
    
    console.log("-------------------------------");
    
    console.log(req.body);
    req.body.user = req.user.id;

    console.log("-------------------------------");
    
    console.log(req.body);
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next(new ErrorResponse(`No Bootcamp with the id of ${req.params.bootcampId}`),404);
    }
        // bootcamp.user is an id for the owner 
        // and its an object not a string so we need to compare it as a string with the id of the request
    if (bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to add a course to this bootcamp`, 401)
          );
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

        // bootcamp.user is an id for the owner 
        // and its an object not a string so we need to compare it as a string with the id of the request
        if (course.user.toString() !== req.user.id && req.user.role !=='admin'){
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401)
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
 
        // bootcamp.user is an id for the owner 
        // and its an object not a string so we need to compare it as a string with the id of the request
          if (course.user.toString() !== req.user.id && req.user.role !=='admin'){
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401)
              );
        }
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true,
        data:{}
    });
});