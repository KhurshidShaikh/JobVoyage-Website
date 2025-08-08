import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { postJob, getAllJobs, getJobById, getAdminJobs, getRecommendedJobs, getJobSuggestions, deleteJob, searchJobs, getAppliedJobs } from '../controllers/jobController.js';
import Authenticate from '../middlewares/isAuthenticated.js';
const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.get('/get-recommended-jobs', Authenticate, getRecommendedJobs);
router.delete('/delete/:id', Authenticate, deleteJob);
router.route("/get/:id").get(getJobById);
router.route("/suggestions").get(getJobSuggestions);
router.route("/search").get(searchJobs);
export default router;

