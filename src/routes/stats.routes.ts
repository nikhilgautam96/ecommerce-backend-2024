import { Router } from 'express';
import {
    getBarChart,
    getDashBoardStats,
    getLineChart,
    getPieChart,
} from '../controllers/stats.contoller.js';
import { adminOnly } from '../middlewares/auth.middleware.js';

const app: Router = Router();

// route - /api/v1/dashboard/stats
app.get('/stats', adminOnly, getDashBoardStats);

// route - /api/v1/dashboard/pie
app.get('/pie', adminOnly, getPieChart);

// route - /api/v1/dashboard/bar
app.get('/bar', adminOnly, getBarChart);

// route - /api/v1/dashboard/line
app.get('/line', adminOnly, getLineChart);

export default app;
