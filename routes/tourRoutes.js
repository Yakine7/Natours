const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// router.param("id", tourController.checkId);

// POST /tour/213dfde54/review
// GET /tour/213dfde54/review
// GET /tour/213fde54/review/549sd48d5

// router
//     .route("/:tourId/reviews")
//     .post(
//         authController.protect,
//         authController.restrictTo("user"),
//         reviewController.createReview,
//     );
router.use("/:tourId/reviews", reviewRouter);

router
    .route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router
    .route("/monthly-plan/:year")
    .get(
        authController.protect,
        authController.restrictTo("admin", "lead-gead", "guide"),
        tourController.getMonthlyPlan,
    );

router
    .route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(tourController.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router
    .route("/")
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.createTour,
    );

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo("admin", "lead-gead"),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour,
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-gead"),
        tourController.deleteTour,
    );

module.exports = router;
