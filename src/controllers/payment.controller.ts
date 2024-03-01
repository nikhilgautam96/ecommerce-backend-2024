import { razorpay, stripe } from '../app.js';
import { tryCatch } from '../middlewares/error.middleware.js';
import { Coupon } from '../models/coupon.model.js';
import ErrorHandler from '../utils/error.js';
import mongoose from 'mongoose';
import { PaymentParties } from '../enums/payment.enum.js';

export const createPaymentIntent = tryCatch(async (req, res, next) => {
    // const { paymentParty } = req.params;
    const { discountAmount, paymentParty } = req.body;
    // console.log(req.params, req.query);

    if (!discountAmount) {
        return next(new ErrorHandler('Please enter amount', 400));
    }

    let paymentResponse;
    if (paymentParty === PaymentParties.RAZORPAY) {
        const orderResponse = await razorpay.orders.create({
            amount: Number(512),
            currency: 'INR',
            receipt: 'order_rcptid_01',
        });
        paymentResponse = orderResponse.id;
    } else if (paymentParty === PaymentParties.STRIPE) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(762) * 100, // in PAISE
            currency: 'INR',
        });
        paymentResponse = paymentIntent.client_secret;
    }

    return res.status(201).json({
        success: true,
        clientSecret: paymentResponse,
    });
});

export const createCoupon = tryCatch(async (req, res, next) => {
    const { couponCode, discountAmount } = req.body;

    if (!couponCode || !discountAmount) {
        return next(
            new ErrorHandler('Please enter both coupon and amount', 400)
        );
    }

    await Coupon.create({
        couponCode,
        discountAmount,
    });

    return res.status(201).json({
        success: true,
        message: `Coupon ${couponCode} Created Successfully.`,
    });
});

export const applyDiscount = tryCatch(async (req, res, next) => {
    const { couponCode } = req.query;

    const discount = await Coupon.findOne({ couponCode });

    if (!discount) {
        return next(new ErrorHandler('Invalid coupon code', 400));
    }

    return res.status(200).json({
        success: true,
        discount: discount.discountAmount,
    });
});

export const allCoupons = tryCatch(async (req, res, next) => {
    const coupons = await Coupon.find({});

    return res.status(200).json({
        success: true,
        coupons,
    });
});

export const deleteCoupon = tryCatch(async (req, res, next) => {
    const { id } = req.params;

    /**
     *
     * In this case, id is assumed to be a string or a value that matches the type of the _id field
     * in your MongoDB collection.
     * Using { id } as an object could lead to unexpected behavior or errors, as Mongoose typically
     * expects just the value for the _id when querying by ID.
     *
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler('Invalid Coupon Id', 400));
    }
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) return next(new ErrorHandler('Invalid Coupon Id', 400));

    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon?.couponCode} deleted successfully.`,
    });
});
