import { Request, Response, NextFunction } from 'express';
import { tryCatch } from '../middlewares/error.middleware.js';
import {
    BaseQuery,
    NewProductRequestBody,
    SearchRequestQuery,
} from '../types/types.js';
import { Product } from '../models/product.model.js';
import ErrorHandler from '../utils/error.js';
import { rm } from 'fs';
import { myCache } from '../app.js';
import { invalidatesCache } from '../utils/revalidateMemCache.js';

export const newProduct = tryCatch(
    async (
        req: Request<{}, {}, NewProductRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { name, price, stock, category } = req.body;
        const photo = req.file;

        if (!photo) return next(new ErrorHandler('Please add a photo.', 400));
        if (!name || !price || !stock || !category) {
            // if any field is missing, remove the associated Pic as well.
            rm(photo.path, () => {
                console.log('Deleted.');
            });
            return next(new ErrorHandler('Please enter all fields', 400));
        }

        await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photo: photo?.path,
        });
        invalidatesCache({ product: true });

        return res.status(201).json({
            success: true,
            message: 'Product Created successfully.',
        });
    }
);

// Revalidate on New, Update, Delete Product and on New order.
export const getLatestProducts = tryCatch(async (req, res, next) => {
    let products = [];
    if (myCache.has('latest-products')) {
        products = JSON.parse(myCache.get('latest-products') as string);
    } else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set('latest-products', JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        message: 'Latest 5 products fetched successfully.',
        products,
    });
});

// Revalidate on New, Update, Delete Product and on New order.
export const getAllCategories = tryCatch(async (req, res, next) => {
    let categories = [];
    if (myCache.has('categories')) {
        categories = JSON.parse(myCache.get('categories') as string);
    } else {
        categories = await Product.distinct('category');
        myCache.set('categories', JSON.stringify(categories));
    }

    return res.status(200).json({
        success: true,
        message: 'Fetched all unique categories.',
        categories,
    });
});

// Revalidate on New, Update, Delete Product and on New order.
export const getAdminProducts = tryCatch(async (req, res, next) => {
    let products = [];
    if (myCache.has('all-products')) {
        products = JSON.parse(myCache.get('all-products') as string);
    } else {
        products = await Product.find({});
        myCache.set('all-products', JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        message: 'Fetched all products',
        products,
    });
});

// Revalidate on Update, Delete Product and on New Order.
export const getSingleProduct = tryCatch(async (req, res, next) => {
    let product;
    const { id } = req.params;
    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`) as string);
    } else {
        product = await Product.findById(id);
        if (!product) return next(new ErrorHandler('Product not found', 404));
        myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        message: 'Fetched single product.',
        product,
    });
});

export const updateSingleProduct = tryCatch(
    async (
        req: Request<{ id: string }, {}, NewProductRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { id } = req.params;
        const { name, price, stock, category } = req.body;
        const photo = req.file;

        const product = await Product.findById(id);
        if (!product) return next(new ErrorHandler('Invalid Id.', 404));

        if (photo) {
            rm(product.photo, () => {
                console.log('photo deleted.');
            });
            product.photo = photo.path;
        }
        if (name) product.name = name;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (category) product.category = category;

        await product.save();
        invalidatesCache({
            product: true,
            admin: true,
            productId: [String(product._id)],
        });

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
        });
    }
);

export const deleteSingleProduct = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new ErrorHandler('Product not found', 404));
    rm(product.photo, () => {
        console.log('photo deleted.');
    });
    await Product.deleteOne({ _id: id });
    invalidatesCache({
        product: true,
        admin: true,
        productId: [String(product._id)],
    });

    return res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
    });
});

export const getAllProductsWithFilter = tryCatch(
    async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
        const { searchString, sort, category, price } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const offset = (page - 1) * limit;

        const baseQuery: BaseQuery = {};
        if (searchString)
            baseQuery.name = {
                $regex: searchString,
                $options: 'i', // case-insensitive search.
            };
        if (price)
            baseQuery.price = {
                $lte: Number(price), // less than equal to
            };
        if (category) baseQuery.category = category;

        const [products, productsLength] = await Promise.all([
            Product.find(baseQuery)
                .sort(sort && { price: sort === 'asc' ? 1 : -1 })
                .limit(limit)
                .skip(offset),
            Product.countDocuments(baseQuery),
        ]);

        const totalPage = Math.ceil(productsLength / limit);

        return res.status(200).json({
            success: true,
            products,
            totalPage,
        });
    }
);
