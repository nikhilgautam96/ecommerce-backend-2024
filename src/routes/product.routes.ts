import { Router } from 'express';
import { adminOnly } from '../middlewares/auth.middleware.js';
import { singleUpload } from '../middlewares/multer.middleware.js';
import {
    getAllProductsWithFilter,
    deleteSingleProduct,
    updateSingleProduct,
    getSingleProduct,
    getAdminProducts,
    getAllCategories,
    getLatestProducts,
    newProduct,
} from '../controllers/product.controller.js';

const app: Router = Router();

// create a new product - /api/v1/products/new
app.post('/new', adminOnly, singleUpload, newProduct);

// fetch latest(10) products - /api/v1/products/latest
app.get('/latest', getLatestProducts);

// get all unique categories - /api/v1/products/categories
app.get('/categories', getAllCategories);

// get all products - /api/v1/products/admin-products
app.get('/admin-products', adminOnly, getAdminProducts);

// get all products - /api/v1/products/all
app.get('/all', getAllProductsWithFilter);

// get, update and delete single product.
app.route('/:id')
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateSingleProduct)
    .delete(adminOnly, deleteSingleProduct);

export default app;
