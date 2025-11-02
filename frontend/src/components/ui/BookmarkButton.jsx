import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { BOOKMARK_API_END_POINT } from '@/utils/constant';

const BookmarkButton = ({ jobId, className = "" }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check bookmark status on component mount
    useEffect(() => {
        checkBookmarkStatus();
    }, [jobId]);

    const checkBookmarkStatus = async () => {
        try {
            const res = await axios.get(`${BOOKMARK_API_END_POINT}/status/${jobId}`, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsBookmarked(res.data.isBookmarked);
            }
        } catch (error) {
            console.error('Error checking bookmark status:', error);
        }
    };

    const handleBookmarkToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            if (isBookmarked) {
                // Remove bookmark
                const res = await axios.delete(`${BOOKMARK_API_END_POINT}/remove/${jobId}`, {
                    withCredentials: true
                });
                
                if (res.data.success) {
                    setIsBookmarked(false);
                    toast.success('Job removed from bookmarks');
                }
            } else {
                // Add bookmark
                const res = await axios.post(`${BOOKMARK_API_END_POINT}/add`, 
                    { jobId }, 
                    { withCredentials: true }
                );
                
                if (res.data.success) {
                    setIsBookmarked(true);
                    toast.success('Job bookmarked successfully');
                }
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            const message = error.response?.data?.message || 'Failed to update bookmark';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleBookmarkToggle}
            disabled={isLoading}
            className={`
                p-2 rounded-full transition-all duration-200 
                hover:bg-gray-100 dark:hover:bg-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
            {isBookmarked ? (
                <BookmarkCheck 
                    className={`w-5 h-5 text-blue-600 ${isLoading ? 'animate-pulse' : ''}`} 
                />
            ) : (
                <Bookmark 
                    className={`w-5 h-5 text-gray-500 hover:text-blue-600 ${isLoading ? 'animate-pulse' : ''}`} 
                />
            )}
        </button>
    );
};

export default BookmarkButton;
