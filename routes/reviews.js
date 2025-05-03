const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getReviews,
  addReview,
  getReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");
const router = express.Router({ mergeParams: true });
const Review = require("../models/Review");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User");

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect,authorize("user","admin"),deleteReview);

  router
  .route("/")
  .get(
    advancedResults(Review, [
      {
        path: "bootcamp",
        select: "name description"
      },
      {
        path: "user",
        select: "name"
      }
    ]),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);
module.exports = router;
