import express from "express";
import Authenticate from "../middlewares/isAuthenticated.js";
import { 
    addBookmark, 
    removeBookmark, 
    getBookmarkedJobs, 
    checkBookmarkStatus, 
    getBookmarkStats 
} from "../controllers/bookmarkController.js";

const router = express.Router();

// Add bookmark
router.post("/add", Authenticate, addBookmark);

// Remove bookmark
router.delete("/remove/:jobId", Authenticate, removeBookmark);

// Get all bookmarked jobs
router.get("/", Authenticate, getBookmarkedJobs);

// Check bookmark status for a job
router.get("/status/:jobId", Authenticate, checkBookmarkStatus);

// Get bookmark statistics
router.get("/stats", Authenticate, getBookmarkStats);

export default router;
