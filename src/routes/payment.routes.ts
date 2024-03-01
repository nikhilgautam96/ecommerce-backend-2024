import { Router } from 'express';
import { adminOnly } from '../middlewares/auth.middleware.js';
import {
    allCoupons,
    applyDiscount,
    createCoupon,
    deleteCoupon,
    createPaymentIntent,
} from '../controllers/payment.controller.js';

const app: Router = Router();

// route -> "/api/v1/payment/create"
app.post('/create', createPaymentIntent);

// route -> "/api/v1/payment/discount"
app.get('/discount', applyDiscount);

// route -> "/api/v1/payment/coupon/new"
app.post('/coupon/new', adminOnly, createCoupon);

// route -> "/api/v1/payment/coupon/all"
app.get('/coupon/all', adminOnly, allCoupons);

// route -> "/api/v1/payment/coupon/:id"
app.delete('/coupon/:id', adminOnly, deleteCoupon);

export default app;
