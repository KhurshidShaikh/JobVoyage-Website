import { useState, useEffect } from 'react';
import axios from 'axios';
import { BOOKMARK_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

export const useBookmarks = () => {
    const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalBookmarks: 0, recentBookmarks: 0 });

    const fetchBookmarkedJobs = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const res = await axios.get(`${BOOKMARK_API_END_POINT}?page=${page}&limit=${limit}`, {
                withCredentials: true
            });
            
            if (res.data.success) {
                setBookmarkedJobs(res.data.jobs);
                return res.data;
            }
        } catch (error) {
            console.error('Error fetching bookmarked jobs:', error);
            toast.error('Failed to fetch bookmarked jobs');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookmarkStats = async () => {
        try {
            const res = await axios.get(`${BOOKMARK_API_END_POINT}/stats`, {
                withCredentials: true
            });
            
            if (res.data.success) {
                setStats({
                    totalBookmarks: res.data.totalBookmarks,
                    recentBookmarks: res.data.recentBookmarks
                });
            }
        } catch (error) {
            console.error('Error fetching bookmark stats:', error);
        }
    };

    const removeBookmark = async (jobId) => {
        try {
            const res = await axios.delete(`${BOOKMARK_API_END_POINT}/remove/${jobId}`, {
                withCredentials: true
            });
            
            if (res.data.success) {
                setBookmarkedJobs(prev => prev.filter(job => job._id !== jobId));
                setStats(prev => ({ 
                    ...prev, 
                    totalBookmarks: prev.totalBookmarks - 1 
                }));
                toast.success('Bookmark removed successfully');
                return true;
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
            toast.error('Failed to remove bookmark');
            return false;
        }
    };

    useEffect(() => {
        fetchBookmarkStats();
    }, []);

    return {
        bookmarkedJobs,
        loading,
        stats,
        fetchBookmarkedJobs,
        fetchBookmarkStats,
        removeBookmark
    };
};
