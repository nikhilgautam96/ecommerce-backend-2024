import { myCache } from '../app.js';
import { tryCatch } from '../middlewares/error.middleware.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import {
    calculatePercentage,
    getCategories,
    getHistoricalData,
    MyDocument,
} from '../utils/features.js';
import { AdminKeys } from '../enums/admin.enum.js';

export const getDashBoardStats = tryCatch(async (req, res, next) => {
    let stats = {};
    if (myCache.has(AdminKeys.ADMIN_STATS))
        stats = JSON.parse(myCache.get(AdminKeys.ADMIN_STATS) as string);
    else {
        // revenue amount, and percentage increase/decrease
        // user count, amount, and percentage increase/decrease
        // transaction count, amount, and percentage increase/decrease
        // products count, amount, and percentage increase/decrease
        // inventory
        // gender ratio

        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const currentMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0),
        };
        const currentMonthProductsPromise = Product.find({
            createdAt: {
                $gte: currentMonth.start,
                $lte: currentMonth.end,
            },
        });
        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const currentMonthUsersPromise = User.find({
            createdAt: {
                $gte: currentMonth.start,
                $lte: currentMonth.end,
            },
        });
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const currentMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: currentMonth.start,
                $lte: currentMonth.end,
            },
        });
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        });
        const latestTransactionsPromise = Order.find({})
            .select(['orderItems', 'discount', 'total', 'status'])
            .limit(4);

        const [
            currentMonthProducts,
            currentMonthUsers,
            currentMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            totalProducts,
            totalUsers,
            allOrders,
            lastSixMonthOrders,
            uniqueCategories,
            maleUsersCount,
            latestTransactions,
        ] = await Promise.all([
            currentMonthProductsPromise,
            currentMonthUsersPromise,
            currentMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select('total'),
            lastSixMonthOrdersPromise,
            Product.distinct('category'),
            User.countDocuments({ gender: 'male' }),
            latestTransactionsPromise,
        ]);

        const currentMonthRevenue = currentMonthOrders.reduce(
            (total, order) => total + (order.total || 0),
            0
        );
        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, order) => total + (order.total || 0),
            0
        );
        const totalRevenue = allOrders.reduce(
            (total, order) => total + (order.total || 0),
            0
        );

        const changePercent = {
            revenue: calculatePercentage(currentMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(
                currentMonthProducts.length,
                lastMonthProducts.length
            ),
            user: calculatePercentage(
                currentMonthUsers.length,
                lastMonthUsers.length
            ),
            order: calculatePercentage(
                currentMonthOrders.length,
                lastMonthOrders.length
            ),
        };

        const count = {
            revenue: totalRevenue,
            user: totalUsers,
            product: totalProducts,
            order: allOrders.length,
        };

        const monthlyOrderCount = new Array(6).fill(0);
        const monthlyOrderRevenueCount = new Array(6).fill(0);

        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff =
                (today.getMonth() - creationDate.getMonth() + 12) % 12;

            if (monthDiff < 6) {
                monthlyOrderCount[6 - monthDiff - 1] += 1;
                monthlyOrderRevenueCount[6 - monthDiff - 1] += order.total;
            }
        });

        const categoryCount: Record<string, number>[] = await getCategories(
            uniqueCategories,
            totalProducts
        );

        const userGenderRatio = {
            male: maleUsersCount,
            female: totalUsers - maleUsersCount,
        };

        const modifiedLatestTransactions = latestTransactions.map((i) => {
            return {
                _id: i._id,
                discount: i.discount,
                amount: i.total,
                quantity: i.orderItems.length,
                status: i.status,
            };
        });
        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: monthlyOrderCount,
                revenue: monthlyOrderRevenueCount,
            },
            userGenderRatio,
            latestTransaction: modifiedLatestTransactions,
        };
        myCache.set(AdminKeys.ADMIN_STATS, JSON.stringify(stats));
    }

    return res.status(200).json({
        success: true,
        stats,
    });
});

export const getPieChart = tryCatch(async (req, res, next) => {
    let charts = {};
    if (myCache.has(AdminKeys.ADMIN_PIE_CHARTS)) {
        charts = JSON.parse(myCache.get(AdminKeys.ADMIN_PIE_CHARTS) as string);
    } else {
        const allOrderPromise = await Order.find({}).select([
            'total',
            'discount',
            'subtotal',
            'tax',
            'shippingCharges',
        ]);
        const [
            processingOrder,
            shippedOrder,
            deliveredOrder,
            uniqueCategories,
            totalProducts,
            productsOutOfStock,
            allOrders,
            allUsers,
            adminUserCount,
        ] = await Promise.all([
            Order.countDocuments({ status: 'Processing' }),
            Order.countDocuments({ status: 'Shipped' }),
            Order.countDocuments({ status: 'Delivered' }),
            Product.distinct('category'),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            allOrderPromise,
            User.find({}).select('dob'),
            User.countDocuments({ role: 'admin' }),
        ]);

        // 1st chart
        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        };
        // 2nd chart
        const productCategories: Record<string, number>[] = await getCategories(
            uniqueCategories,
            totalProducts
        );
        // 3rd chart
        const stockAvailability = {
            inStock: totalProducts - productsOutOfStock,
            outOfStock: productsOutOfStock,
        };
        // 4th chart
        const grossIncome = allOrders.reduce(
            (prev, order) => prev + (order.total || 0),
            0
        );
        const discount = allOrders.reduce(
            (prev, order) => prev + (order.discount || 0),
            0
        );
        const productionCost = allOrders.reduce(
            (prev, order) => prev + (order.shippingCharges || 0),
            0
        );
        const burnt = allOrders.reduce(
            (prev, order) => prev + (order.tax || 0),
            0
        );
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin =
            grossIncome - discount - productionCost - burnt - marketingCost;
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };

        const adminCustomer = {
            admin: adminUserCount,
            customer: allUsers.length - adminUserCount,
        };

        const userAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age > 40).length,
        };

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            adminCustomer,
            userAgeGroup,
        };

        myCache.set(AdminKeys.ADMIN_PIE_CHARTS, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    });
});

export const getBarChart = tryCatch(async (req, res, next) => {
    let charts = {};
    if (myCache.has(AdminKeys.ADMIN_BAR_CHARTS)) {
        charts = JSON.parse(myCache.get(AdminKeys.ADMIN_BAR_CHARTS) as string);
    } else {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const lastSixMonthsProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select('createdAt');
        const lastSixMonthsUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select('createdAt');
        const lastTwelveMonthsOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        }).select('createdAt');

        const [products, users, orders] = await Promise.all([
            lastSixMonthsProductsPromise,
            lastSixMonthsUsersPromise,
            lastTwelveMonthsOrdersPromise,
        ]);

        const productCount = getHistoricalData({
            monthLength: 6,
            documentArr: products.map((p) => ({
                createdAt: p.createdAt,
            })) as MyDocument[],
            today,
        });
        const userCount = getHistoricalData({
            monthLength: 6,
            documentArr: users,
            today,
        });
        const orderCount = getHistoricalData({
            monthLength: 12,
            documentArr: orders.map((o) => ({
                createdAt: o.createdAt,
            })) as MyDocument[],
            today,
        });

        charts = {
            products: productCount,
            users: userCount,
            orders: orderCount,
        };

        myCache.set(AdminKeys.ADMIN_BAR_CHARTS, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    });
});

export const getLineChart = tryCatch(async (req, res, next) => {
    let charts = {};
    if (myCache.has(AdminKeys.ADMIN_LINE_CHARTS)) {
        charts = JSON.parse(myCache.get(AdminKeys.ADMIN_LINE_CHARTS) as string);
    } else {
        const today = new Date();

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        };

        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select('createdAt'),
            User.find(baseQuery).select('createdAt'),
            Order.find(baseQuery).select(['createdAt', 'discount', 'total']),
        ]);

        const productCount = getHistoricalData({
            monthLength: 12,
            documentArr: products.map((p) => ({
                createdAt: p.createdAt,
            })) as MyDocument[],
            today,
        });
        const userCount = getHistoricalData({
            monthLength: 12,
            documentArr: users,
            today,
        });
        const discount = getHistoricalData({
            monthLength: 12,
            documentArr: orders.map((o) => ({
                createdAt: o.createdAt,
                discount: o.discount,
                total: o.total,
            })) as MyDocument[],
            today,
            property: 'discount',
        });
        const revenue = getHistoricalData({
            monthLength: 12,
            documentArr: orders.map((o) => ({
                createdAt: o.createdAt,
                discount: o.discount,
                total: o.total,
            })) as MyDocument[],
            today,
            property: 'total',
        });

        charts = {
            products: productCount,
            users: userCount,
            discount,
            revenue,
        };

        myCache.set(AdminKeys.ADMIN_LINE_CHARTS, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    });
});
