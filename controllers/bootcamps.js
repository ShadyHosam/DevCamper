const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

// @desc        Get all Bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

  let query;

  const reqQuery = {...req.query};

  // fields we want to remove from the request query 
  const removeFields = ['select','sort','page','limit'];


  // we have to loop over remove fields and remove them from the query
  removeFields.forEach(param =>delete reqQuery[param]);
  
 

  // Convert reqQuery to a string and apply regex
    let queryStr = JSON.stringify(reqQuery);
  queryStr= queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match =>`$${match}`);


    // Convert string back to JSON and query DB
  query = Bootcamp.find(JSON.parse(queryStr)).populate({
    path:'courses',
    select:'title'
  });


  // Handle "select" fields properly
  if (req.query.select){
    const fields = req.query.select.split(',').join(' ');
    console.log(fields);
    query = query.select(fields);
    
  }

  //Sorting

  if(req.query.sort){
      const sortBy = req.query.split(',').join(' ');
      query = query.sort(sortBy);
  }
  else{
    query = query.sort('createdAt');
  }

// Pagination

const page = parseInt(req.query.page,10) || 1;
const limit = parseInt(req.query.limit,10) || 25;

const startingIndex  = (page - 1) * limit;
const endIndex = page * limit;
const total = await Bootcamp.countDocuments();
query = query.skip(startingIndex).limit(limit);
  console.log(total);
  const bootcamps = await query;
  // pagination results
  const pagination ={};
  if (endIndex < total){
    pagination.next = {
      page:page+1,
      limit
    }
  }
  if (startingIndex> 0){
    pagination.prev = {
      page:page - 1,
      limit
    }
  }
console.log(pagination);
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
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
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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

// @desc        DELETE bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }


  await  bootcamp.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc        Get bootcamps withing a radius
// @route       DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
 const {zipcode , distance} = req.params;
 console.log('AXXAAXAXAAAAXXAXAXAXAXAXXXAAAXAXA');
const loc = await geocoder.geocode(zipcode);
const lat = loc[0].latitude;
const lng = loc[0].longitude;

// calcualte radius
// divide the distance by radius of earth 
// earth radius  = 3.963 Mile 
const radius = distance / 3963;
console.log('AXXAAXAXAAAAXXAXAXAXAXAXXXAAAXAXA');
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