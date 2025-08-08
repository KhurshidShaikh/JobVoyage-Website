import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setRecommendedJobs } from '@/redux/jobSlice';

const JOB_API_END_POINT = 'http://localhost:5000/api/user'; // Adjust if different

const useGetRecommendations = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) {
                dispatch(setRecommendedJobs([]));
                return;
            }

            try {
                setLoading(true);
                const res = await axios.get(`${JOB_API_END_POINT}/get-recommended-jobs`, { withCredentials: true });
                dispatch(setRecommendedJobs(res.data.recommended_jobs || []));
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                dispatch(setRecommendedJobs([]));
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, dispatch]);

    return { loading };
};

export default useGetRecommendations;