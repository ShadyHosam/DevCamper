const path = require('path'); 
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const client = require('../utils/redis');

// @desc        Get all Bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
    
});

// @desc        Get a specific Bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

  req.body.user  = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({
    user:req.user.id
  });

  // if the user isn't admin then they can only create one bootcamp
  if (publishedBootcamp  && req.user.role!=='admin'){
    return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp before`,400));
  }
    
  const bootcamp = await Bootcamp.create(req.body);
  client.del('bootcamps',(err,response)=>{
    if(err){
      console.log('Error clearing redis cache',err);
    }
    else{
      console.log('Redis Cache for bootcamps cleared');
    }
  });


  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }


    if (bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401)
      );
    }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc        DELETE bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    // i want to delete a bootcamp
    // i have to make sure the bootcamp exist.
    // i have to make sure the user who is gonna delete is the owner.

    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp){
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 401)
      );
    }
      await bootcamp.deleteOne();

      res.status(200).json({
        success:true,
        data:{}
      })



});

// @desc        Get bootcamps withing a radius
// @route       DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
 const {zipcode , distance} = req.params;
const loc = await geocoder.geocode(zipcode);
const lat = loc[0].latitude;
const lng = loc[0].longitude;

// calcualte radius
// divide the distance by radius of earth 
// earth radius  = 3.963 Mile 
const radius = distance / 3963;
console.log(radius);
const bootcamps = await Bootcamp.find({
location:{   $geoWithin: { $centerSphere: [ [ lng, lat], radius ] }}
});

console.log(bootcamps);
res.status(200).json({
    success:true,
    count : bootcamps.length,
    data:bootcamps
})

});


// @desc        Upload Photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  // find the bootcamp id first then check if it exists or no.
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401)
    );
  }

// okay the bootcamp is exist.
// now lets see if there is an uploaded photo
if (!req.files){
  return next(
  new ErrorResponse(`Please upload a file `,400));
}
const file = req.files.file;
  console.log(file)
if (!file.mimetype.startsWith('image')){
  return next(new ErrorResponse(`Please upload an Image file`,400));
}

// check file size

if (file.size > process.env.MAX_FILE_UPLOAD){
  return next(new ErrorResponse(`Please an image less than ${process.env.MAX_FILE_UPLOAD}`),400);
}
// create custom file name
file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
console.log(file.name);
file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
  if (err){
    console.log(err);
    return next(
      new ErrorResponse(`Problem with file upload`,500)
    );}
    await Bootcamp.findByIdAndUpdate(req.params.id , {
      photo : file.name
    });
}
   
)
  res.status(200).json({
    success: true,
    data: file.name
  });
});
