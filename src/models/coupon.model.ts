import mongoose, { Schema, model } from 'mongoose';

const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: [true, 'Please enter the coupon code.'],
        unique: true,
    },
    discountAmount: {
        type: Number,
        required: [true, 'Please enter the Discount Amount.'],
    },
});
export const Coupon = model('Coupon', couponSchema);
