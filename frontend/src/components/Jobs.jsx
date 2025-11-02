import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Jobs = () => {
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState([]); 

    useEffect(() => {
        if (Array.isArray(allJobs)) {
            if (searchedQuery) {
                const filteredJobs = allJobs.filter((job) => {
                    return job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                        job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                        job.location.toLowerCase().includes(searchedQuery.toLowerCase());
                });
                setFilterJobs(filteredJobs);
            } else {
                setFilterJobs(allJobs);
            }
        } else {
            setFilterJobs([]);
        }
    }, [allJobs, searchedQuery]);

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-8">
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
                    {/* Filter Sidebar - Hidden on mobile, visible on desktop */}
                    <div className='hidden lg:block lg:w-64 flex-shrink-0'>
                        <FilterCard />
                    </div>
                    
                    {/* Mobile Filter Toggle */}
                    <div className='lg:hidden mb-4'>
                        <details className='bg-white rounded-lg shadow-md'>
                            <summary className='cursor-pointer p-4 font-semibold text-gray-700 hover:bg-gray-50 rounded-lg'>
                                Filter Jobs
                            </summary>
                            <div className='p-4 border-t'>
                                <FilterCard />
                            </div>
                        </details>
                    </div>
                    
                    {/* Jobs Grid */}
                    <div className='flex-1'>
                        {
                            filterJobs.length <= 0 ? (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 text-lg'>Job not found</p>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
                                    {
                                        filterJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
