import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './utils/db.js';
import userRoute from './routes/authRoute.js';
import companyRoute from './routes/compRoute.js';
import jobRoute from './routes/jobRoute.js';
import applicationRoute from './routes/appRoute.js';
import emailRoute from './routes/emailRoute.js';
import rankRoutes from './routes/rankRoute.js';
import axios from 'axios';
import { User } from './models/User.js';
import Authenticate from './middlewares/isAuthenticated.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API Routes
app.use("/api/user", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);
app.use("/api/email", emailRoute);
app.use("/api/job", rankRoutes);

app.get('/api/user/get-recommended-jobs', Authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.id).select('profile.skills');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const skills = user.profile?.skills || [];
        if (skills.length === 0) {
            return res.status(200).json({ recommended_jobs: [] });
        }

        const mlResponse = await axios.post('http://localhost:5001/predict', { skills }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        res.status(200).json({ recommended_jobs: mlResponse.data.recommended_jobs || [] });
    } catch (error) {
        console.error('Error in get-recommended-jobs:', error.message);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running at http://localhost:${PORT}`);
});