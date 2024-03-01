import { tryCatch } from './error.middleware.js';
import ErrorHandler from '../utils/error.js';
import { User } from '../models/user.model.js';

// Middleware to make sure only admin is allowed.
export const adminOnly = tryCatch(async (req, res, next) => {
    const { id } = req.query;

    if (!id) return next(new ErrorHandler('Must login first.', 401));

    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler('Invalid Id.', 401));
    if (user.role !== 'admin')
        return next(new ErrorHandler('Admin access prohibited.', 403));
    next();
});
