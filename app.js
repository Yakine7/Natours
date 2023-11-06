const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const app = express();

app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 1) GLOBAL MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Security HTTP Headers

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                scriptSrc: [
                    "blob:",
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "cdnjs.cloudflare.com",
                    "*.mapbox.com",
                    "*.paypal.com",
                ],
                defaultSrc: ["'self'", "*.mapbox.com", "*.paypal.com"],
            },
        },
    }),
);

app.use(compression());
// Development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(
    express.json({
        limit: "10kb",
    }),
);
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

// Data sanitization againsst NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            "duration",
            "ratingsQuantity",
            "ratingsAverage",
            "maxGroupSize",
            "difficulty",
            "price",
        ],
    }),
);

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) Routes
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/reviews", reviewRouter);

app.use("/api/v1/bookings", bookingRouter);
// 4) START SERVER

app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: "fail",
    //     message: `Can't find ${req.originalUrl} on this server`,
    // });
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.statusCode = 404;
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
