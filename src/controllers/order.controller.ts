import { Request, Response, NextFunction } from 'express';
import { tryCatch } from '../middlewares/error.middleware.js';
import { NewOrderRequestBody } from '../types/types.js';
import { Order } from '../models/order.model.js';
import { invalidatesCache } from '../utils/revalidateMemCache.js';
import { reduceStock } from '../utils/features.js';
import ErrorHandler from '../utils/error.js';
import { myCache } from '../app.js';

export const newOrder = tryCatch(
    async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
        const {
            shippingInfo,
            orderItems,
            user,
            subtotal,
            tax,
            shippingCharges,
            discount,
            total,
        } = req.body;

        if (
            !shippingInfo ||
            !orderItems ||
            !user ||
            !subtotal ||
            !tax ||
            !total
        )
            return next(new ErrorHandler('Please Enter All Fields', 400));

        await Order.create({
            shippingInfo,
            orderItems,
            user,
            subtotal,
            tax,
            shippingCharges,
            discount,
            total,
        });
        await reduceStock(orderItems);
        invalidatesCache({
            product: true,
            order: true,
            admin: true,
            userId: user,
            productId: orderItems.map((i) => String(i.productId)),
        });

        return res.status(201).json({
            success: true,
            message: 'Order Placed Successfully',
        });
    }
);

export const myOrderHistory = tryCatch(async (req, res, next) => {
    const { id: user } = req.query;
    const key = `my-orders-${user}`;
    let orders = [];
    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
        orders = await Order.find({ user });
        myCache.set(key, JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        orders,
    });
});

export const allOrders = tryCatch(async (req, res, next) => {
    const key = 'all-orders';
    let orders = [];
    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
        // to take only the 'name' and 'id' field from the user.
        orders = await Order.find().populate('user', 'name');
        myCache.set(key, JSON.stringify(orders));
    }

    return res.status(200).json({
        success: true,
        orders,
    });
});

export const getSingleOrder = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const key = `order-${id}`;
    let order;
    if (myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
    else {
        // to take only the 'name' and 'id' field from the user.
        order = await Order.findById(id).populate('user', 'name');
        if (!order) return next(new ErrorHandler('Order Not Found', 404));
        myCache.set(key, JSON.stringify(order));
    }

    return res.status(200).json({
        success: true,
        order,
    });
});

// called by 'admin' only.
// when 'newOrder' is created, 'status' is = 'Processing'.
//      -> then 'processOrder' is called by 'admin. thus, 'status' becomes = 'Shipped'.
//      -> then again 'processOrder' is called by 'admin'. thus, 'status' becomes = 'Delivered'.
export const processOrder = tryCatch(
    async (
        req: Request<{ id: string }, {}, NewOrderRequestBody>,
        res,
        next
    ) => {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return next(new ErrorHandler('Order Not Found', 404));

        switch (order.status) {
            case 'Processing':
                order.status = 'Shipped';
                break;
            case 'Shipped':
                order.status = 'Delivered';
                break;
            default:
                order.status = 'Delivered';
                break;
        }

        await order.save();

        invalidatesCache({
            product: false,
            order: true,
            admin: true,
            userId: order.user,
            orderId: String(order._id),
        });

        res.status(200).json({
            success: true,
            mesage: 'Order Processed Successfully',
        });
    }
);

// called by 'admin' only.
export const deleteOrder = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler('Order Not Found', 404));

    await order.deleteOne();

    invalidatesCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
    });

    res.status(200).json({
        success: true,
        mesage: 'Order Deleted Successfully',
    });
});
