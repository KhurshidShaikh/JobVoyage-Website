import React, { useEffect, useState } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage } from './ui/avatar';
import { Bookmark, MapPin, Calendar, Briefcase, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BookmarkedJobs = () => {
    const { bookmarkedJobs, loading, stats, fetchBookmarkedJobs, removeBookmark } = useBookmarks();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        loadBookmarkedJobs(1);
    }, []);

    const loadBookmarkedJobs = async (page) => {
        const result = await fetchBookmarkedJobs(page, 6);
        if (result) {
            setCurrentPage(result.currentPage);
            setTotalPages(result.totalPages);
        }
    };

    const handleRemoveBookmark = async (jobId) => {
        await removeBookmark(jobId);
    };

    const handleViewJob = (jobId) => {
        navigate(`/description/${jobId}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && bookmarkedJobs.length === 0) {
        return (
            <div className="max-w-7xl mx-auto my-10 px-4">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto my-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Bookmark className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Bookmarked Jobs
                    </h1>
                </div>
                
                {/* Stats */}
                <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {stats.totalBookmarks} Total Bookmarks
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {stats.recentBookmarks} Added This Week
                    </span>
                </div>
            </div>

            {/* Empty State */}
            {bookmarkedJobs.length === 0 && !loading ? (
                <div className="text-center py-16">
                    <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Bookmarked Jobs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start bookmarking jobs you're interested in to see them here.
                    </p>
                    <Button onClick={() => navigate('/browse')} className="bg-blue-600 hover:bg-blue-700">
                        Browse Jobs
                    </Button>
                </div>
            ) : (
                <>
                    {/* Jobs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {bookmarkedJobs.map((job, index) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                            >
                                <div className="p-6">
                                    {/* Company Info */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage 
                                                    src={job.company?.logo} 
                                                    alt={job.company?.name}
                                                />
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                    {job.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {job.company?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveBookmark(job._id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Job Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            Bookmarked on {formatDate(job.bookmarkedAt)}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Briefcase className="w-4 h-4" />
                                            {job.jobType} • {job.experienceLevel}
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    {job.salary && (
                                        <div className="mb-4">
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                ₹{job.salary}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Description Preview */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {job.description}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleViewJob(job._id)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => loadBookmarkedJobs(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            
                            <span className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            
                            <Button
                                variant="outline"
                                onClick={() => loadBookmarkedJobs(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BookmarkedJobs;
