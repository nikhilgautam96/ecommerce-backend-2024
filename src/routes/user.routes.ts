import { Router } from 'express';
import {
    newUser,
    getAllUsers,
    getUser,
    deleteUser,
} from '../controllers/user.controller.js';
import { adminOnly } from '../middlewares/auth.middleware.js';

const app: Router = Router();

// route -> "/api/v1/user/new"
app.post('/new', newUser);

// route -> "/api/v1/user/all"
app.get('/all', adminOnly, getAllUsers);

// route -> "/api/v1/user/dynamicID"
app.route('/:id').get(getUser).delete(adminOnly, deleteUser);

export default app;
