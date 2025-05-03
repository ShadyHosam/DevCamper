const Review = require("../models/Review");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get all Reviews
// @route       GET  /api/v1/courses/bootcampId/reviews
// @route       GET /api/v1/reviews
// @access      Public

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({
      bootcamp: req.params.bootcampId,
    }).populate([
      {
        path: "User",
        select: "name",
      },
    ]);
  } else {
    res.status(200).json(res.advancedResults);
  }
});
// @desc        Get Single Review
// @route       GET  /api/v1/reviews/:id
// @access      Public

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(
      new ErrorResponse(`No review found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc        Add Review
// @route       POST  /api/v1/bootcamps/:bootcampId/reviews
// @access      Private

exports.addReview = asyncHandler(async (req, res, next) => {
  // so if we are trying to create a review we need 2 things
  // 1- the id of the bootcamp
  // 2- body of the review
  /*
        title
        text
        rating
    */

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id ${req.params.bootcampId}`, 404)
    );
  }
  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc        Update Review
// @route       PUT  /api/v1/bootcamps/reviews/:id
// @access      Private

exports.updateReview = asyncHandler(async (req, res, next) => {
  // we gotta neec the user id and the review id

  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No Review with id ${req.params.id}`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `Not authorized to update this review ${req.params.id}`,
        401
      )
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc        Delete a Review
// @route       DELETE  /api/v1/bootcamps/reviews/:id
// @access      Private

exports.deleteReview = asyncHandler(async (req, res, next) => {
        const review = await Review.findById(req.params.id);

        if (!review){
            return next(new ErrorResponse(`No review has been found with ${req.params.id}`,400));
        }

        // okay we got review now lets delete it 


        if (review.user.toString() !== req.user.id && req.user.role!=='admin'){
            return next(new ErrorResponse(`Not authorized to delete this review ${req.params.id}`,400));
        }
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({
     success:true,
     data:{}
    })

  
});  