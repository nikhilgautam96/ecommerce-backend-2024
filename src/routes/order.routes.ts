import { Router } from 'express';
import { adminOnly } from '../middlewares/auth.middleware.js';
import {
    newOrder,
    myOrderHistory,
    allOrders,
    getSingleOrder,
    processOrder,
    deleteOrder,
} from '../controllers/order.controller.js';

const app: Router = Router();

// route -> "/api/v1/order/new"
app.post('/new', newOrder);

// route -> "/api/v1/order/myOrder"
app.get('/history', myOrderHistory);

// route -> "/api/v1/order/allOrders"
app.get('/all', adminOnly, allOrders);

// route -> GET: "/api/v1/order/getSingleOrder", PUT: "/api/v1/order/processOrder", DELETE: "/api/v1/order/deleteOrder"
app.route('/:id')
    .get(getSingleOrder)
    .put(adminOnly, processOrder)
    .delete(adminOnly, deleteOrder);

export default app;
