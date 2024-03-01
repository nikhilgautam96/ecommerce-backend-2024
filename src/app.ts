import express from 'express';
import { connectDB } from './utils/db.js';
import NodeCache from 'node-cache';
import { config } from 'dotenv';
import morgan from 'morgan';
import Stripe from 'stripe';
// import Error
import { errorMiddleware } from './middlewares/error.middleware.js';

// import routes
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoute from './routes/payment.routes.js';
import dasboardRoute from './routes/stats.routes.js';
import Razorpay from 'razorpay';

config({
    path: './.env',
});
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || '';
const dbName = process.env.DB_NAME || 'Ecommerce_2024';
const stripeKey = process.env.STRIPE_KEY || '';
const razorpayId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKey = process.env.RAZORPAY_KEY || '';

connectDB(mongoURI, dbName);

const app = express();
app.use(express.json());
app.use(morgan('dev'));

export const stripe = new Stripe(stripeKey);
export const razorpay = new Razorpay({
    key_id: razorpayId,
    key_secret: razorpayKey,
});

/**
 *  creating a in memory cache for faster access of data for same requests/operations.
 *      --> The data will stay in cache until the server is restarted.
 *      --> we can pass options in "NodeCache({options})" to delete the data after some time
 *           even the server didnt restart.
 *
 */
export const myCache = new NodeCache();

// default Route
app.get('/', (req, res) => {
    res.send('API working with /api/v1');
});
// Using Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/dashboard', dasboardRoute);

// using 'uploads' as a static folder.
app.use('/uploads', express.static('uploads'));

// Handling Errors:
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server started at PORT: ${port}`);
});
