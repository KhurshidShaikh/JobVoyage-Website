import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import BookmarkButton from './ui/BookmarkButton';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);

    const isInitiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isInitiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const applyJobHandler = async () => {
        if (!user) {
            toast.error("Please log in to apply for this job!");
            return navigate('/login');
        }
        if (singleJob?.applications?.length >= singleJob?.position) {
            toast.error("Application limit reached for this job!");
            return;
        }
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to apply for the job.");
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id));
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch job details.");
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className="max-w-6xl mx-auto my-10 px-4 sm:px-6 lg:px-8">
            <Navbar />
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 lg:p-8 mt-16 sm:mt-20">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{singleJob?.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="text-blue-700 font-bold text-xs" variant="ghost">{singleJob?.position} Positions</Badge>
                            <Badge className="text-[#F83002] font-bold text-xs" variant="ghost">{singleJob?.jobType}</Badge>
                            <Badge className="text-[#7209b7] font-bold text-xs" variant="ghost">{singleJob?.salary} LPA</Badge>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <BookmarkButton jobId={jobId} className="bg-gray-50 hover:bg-gray-100 w-full sm:w-auto" />
                        <Button
                            onClick={isApplied ? null : applyJobHandler}
                            disabled={isApplied}
                            className={`rounded-lg px-4 py-2 w-full sm:w-auto ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[dodgerblue] hover:bg-[#5f32ad]'}`}>
                            {isApplied ? 'Already Applied' : 'Apply Now'}
                        </Button>
                    </div>
                </div>

                {/* Job Details Section */}
                <div className="mt-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Job Details</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base">Role: <span className="font-normal text-gray-800">{singleJob?.title}</span></h3>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base">Location: <span className="font-normal text-gray-800">{singleJob?.location}</span></h3>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base mb-2">Description:</h3>
                            <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{singleJob?.description}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base mb-2">Requirements:</h3>
                            <p className="text-gray-800 text-sm sm:text-base">{singleJob?.requirements}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base">Experience: <span className="font-normal text-gray-800">{singleJob?.experienceLevel} years</span></h3>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base">Salary: <span className="font-normal text-gray-800">{singleJob?.salary} LPA</span></h3>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base">Total Applicants: <span className="font-normal text-gray-800">{singleJob?.applications?.length}</span></h3>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm sm:text-base">Posted Date: <span className="font-normal text-gray-800">{singleJob?.createdAt?.split("T")[0]}</span></h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDescription;
