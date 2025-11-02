import { Bookmark } from "../models/Bookmark.js";
import { Job } from "../models/Job.js";

// Add a job to bookmarks
export const addBookmark = async (req, res) => {
    try {
        const userId = req.id; // From authentication middleware
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required",
                success: false
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Check if already bookmarked
        const existingBookmark = await Bookmark.findOne({ user: userId, job: jobId });
        if (existingBookmark) {
            return res.status(400).json({
                message: "Job already bookmarked",
                success: false
            });
        }

        // Create bookmark
        const bookmark = await Bookmark.create({
            user: userId,
            job: jobId
        });

        return res.status(201).json({
            message: "Job bookmarked successfully",
            success: true,
            bookmark
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Remove a job from bookmarks
export const removeBookmark = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        const bookmark = await Bookmark.findOneAndDelete({ user: userId, job: jobId });
        
        if (!bookmark) {
            return res.status(404).json({
                message: "Bookmark not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Bookmark removed successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get all bookmarked jobs for a user
export const getBookmarkedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bookmarks = await Bookmark.find({ user: userId })
            .populate({
                path: 'job',
                populate: {
                    path: 'company',
                    select: 'name logo'
                }
            })
            .sort({ bookmarkedAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalBookmarks = await Bookmark.countDocuments({ user: userId });

        return res.status(200).json({
            jobs: bookmarks.map(bookmark => ({
                ...bookmark.job.toObject(),
                bookmarkedAt: bookmark.bookmarkedAt
            })),
            totalJobs: totalBookmarks,
            currentPage: page,
            totalPages: Math.ceil(totalBookmarks / limit),
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Check if a job is bookmarked by user
export const checkBookmarkStatus = async (req, res) => {
    try {
        const userId = req.id;
        const { jobId } = req.params;

        const bookmark = await Bookmark.findOne({ user: userId, job: jobId });

        return res.status(200).json({
            isBookmarked: !!bookmark,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get bookmark statistics for user
export const getBookmarkStats = async (req, res) => {
    try {
        const userId = req.id;

        const totalBookmarks = await Bookmark.countDocuments({ user: userId });
        const recentBookmarks = await Bookmark.countDocuments({
            user: userId,
            bookmarkedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });

        return res.status(200).json({
            totalBookmarks,
            recentBookmarks,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
