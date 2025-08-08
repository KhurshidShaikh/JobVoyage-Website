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
        <div style={{ marginTop: '100px' }}>
            <Navbar />
            <div className="max-w-6xl mx-auto my-10">
                <h1 className="font-bold text-xl my-10">Search Results ({allJobs.length})</h1>
                <div className="grid grid-cols-3 gap-4">
                    {
                        allJobs.length > 0 ? (
                            allJobs.map((job) => (
                                <Job key={job._id} job={job} />
                            ))
                        ) : (
                            <span>No jobs available</span>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default Browse;