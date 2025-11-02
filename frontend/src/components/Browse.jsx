import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';

const Browse = () => {
    const dispatch = useDispatch();
    const { allJobs } = useSelector(store => store.job);
    useGetAllJobs();

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        };
    }, [dispatch]);

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-8">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 sm:my-10">
                <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl my-6 sm:my-10">
                    Search Results ({allJobs.length})
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {
                        allJobs.length > 0 ? (
                            allJobs.map((job) => (
                                <Job key={job._id} job={job} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No jobs available</p>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default Browse;