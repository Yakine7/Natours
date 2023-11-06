const paypal = require("paypal-rest-sdk");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerController");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    // 2) Create checkout session
    paypal.configure({
        mode: "sandbox", //sandbox or live
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_SECRET,
    });

    const createPaymentJson = {
        intent: "sale",
        payer: {
            payment_method: "paypal",
        },
        redirect_urls: {
            return_url: `${req.protocol}://${req.get("host")}/?tour=${
                req.params.tourId
            }&user=${req.user.id}&price=${tour.price}`,
            cancel_url: `${req.protocol}://${req.get("host")}/tour/${
                tour.slug
            }`,
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: `${tour.name} Tour`,
                            sku: "001",
                            price: "25.00",
                            currency: "USD",
                            quantity: 1,
                        },
                    ],
                },
                amount: {
                    currency: "USD",
                    total: "25.00",
                },
                description: tour.summary,
            },
        ],
    };

    paypal.payment.create(createPaymentJson, (error, payment) => {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i += 1) {
                if (payment.links[i].rel === "approval_url") {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) return next();
    const payerId = req.query.PayerID;
    const { paymentId } = req.query;

    const executePaymentJson = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "25.00",
                },
            },
        ],
    };

    paypal.payment.execute(
        paymentId,
        executePaymentJson,
        async (error, payment) => {
            if (error) {
                console.log(error.response);
                return next(new AppError(error, 500));
            }
            console.log(JSON.stringify(payment));
            await Booking.create({ tour, user, price });

            res.redirect(req.originalUrl.split("?")[0]);
        },
    );
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
