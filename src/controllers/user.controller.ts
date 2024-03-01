import { Request, Response, NextFunction } from 'express';
import { NewUserRequestBody } from '../types/types.js';
import { User } from '../models/user.model.js';
import ErrorHandler from '../utils/error.js';
import { tryCatch } from '../middlewares/error.middleware.js';
export const newUser = tryCatch(
    async (
        req: Request<{}, {}, NewUserRequestBody>, // Request< {params}, {query}, {requestBody} >
        res: Response,
        next: NextFunction
    ) => {
        const { _id, name, email, photo, gender, dob } = req.body;

        if (!_id || !name || !email || !photo || !gender || !dob)
            return next(new ErrorHandler('Please add all fields.', 400));

        // if user already exists, return user info or login this user.
        let user = await User.findById(_id);
        if (user) {
            return res.status(200).json({
                success: true,
                message: `Welcome, ${user.name}`,
            });
        }

        // else create new user.
        user = await User.create({
            _id,
            name,
            email,
            photo,
            gender,
            dob: new Date(dob),
        });
        return res.status(200).json({
            success: true,
            mesage: `Welcome, ${user.name}`,
        });
    }
);

export const getAllUsers = tryCatch(async (req, res, next) => {
    const allUsers = await User.find({});

    return res.status(200).json({
        success: true,
        allUsers,
    });
});

export const getUser = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return next(new ErrorHandler('Invalid Id', 400));
    return res.status(200).json({
        success: true,
        user,
    });
});

export const deleteUser = tryCatch(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return next(new ErrorHandler('Invalid Id', 400));

    await user.deleteOne();

    return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
});
