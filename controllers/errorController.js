const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/"([^"]*)"/)[1];
    const message = `Duplicate field value: '${value}' Please use another value.`;
    return new AppError(message, 400);
};
const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith("/api")) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
        // RENDERED WEBSITE
    } else {
        res.status(err.statusCode).render("error", {
            title: "Something went wrong",
            msg: err.message,
        });
    }
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    // console.log(errors);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError("Invalid token. Please log in again!", 401);

const handleJWTEXpiredError = () =>
    new AppError("Your token has expired! Please login in again", 401);

const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith("/api")) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });

            // Programming or other unknown error: don't leak error details
        }
        // 1) Log error
        console.error(err);

        // 2) Send generic message
        return res.status(500).json({
            status: "error",
            message: "Something went wrong",
        });
    }
    // RENDERED ERROR
    if (err.isOperational) {
        return res.status(err.statusCode).render("error", {
            title: "Something went wrong",
            msg: err.message,
        });

        // Programming or other unknown error: don't leak error details
    }
    // 1) Log error
    console.error(err);

    // 2) Send generic message
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: "Please try again later.",
    });
};

module.exports = (err, req, res, next) => {
    console.error(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    // console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        // let error = JSON.parse(JSON.stringify(err));
        let error = Object.create(err);
        // console.log(error);
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleJWTEXpiredError();

        sendErrorProd(error, req, res);
    }
};
