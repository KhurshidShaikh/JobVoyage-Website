import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import ApplicantsTable from './ApplicantsTable';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);
    const [jobDetails, setJobDetails] = useState(null);
    const [rankedApplicants, setRankedApplicants] = useState([]);
    const [showRanking, setShowRanking] = useState(false);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                dispatch(setAllApplicants(res.data.job));
                setJobDetails(res.data.job);
            } catch (error) {
                console.error("Error fetching applicants:", error);
            }
        };
        fetchAllApplicants();
    }, [dispatch, params.id]);

    const handleRankApplicants = async () => {
        if (!jobDetails) {
            alert("Job details not available. Please try again.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/api/job/${params.id}/rank`);
            const rankedData = response.data;

            if (!Array.isArray(rankedData)) {
                throw new Error("Invalid response format from backend");
            }

            console.log("Ranking API Response:", rankedData);

            let updatedApplicants = applicants?.applications?.map(applicant => {
                const matchedRank = rankedData.find(a => a.applicantId === applicant.applicant._id);
                return matchedRank
                    ? { ...applicant, score: matchedRank.score }
                    : { ...applicant, score: null };
            });

            updatedApplicants = updatedApplicants.sort((a, b) => {
                if (a.score === null || a.score === undefined) return 1;
                if (b.score === null || b.score === undefined) return -1;
                return b.score - a.score;
            });
            let rank = 1;
            let prevScore = null;
            let numSameScore = 0;

            updatedApplicants = updatedApplicants.map((applicant, index) => {
                if (applicant.score === null || applicant.score === undefined) {
                    return { ...applicant, rank: "N/A" };
                }

                if (applicant.score === prevScore) {
                    numSameScore++;
                } else {
                    rank = index + 1;
                    numSameScore = 1;
                }

                prevScore = applicant.score;
                return { ...applicant, rank };
            });

            console.log("Sorted Applicants with Assigned Ranks:", updatedApplicants);

            setRankedApplicants(updatedApplicants);
            setShowRanking(true);
        } catch (error) {
            console.error("Error ranking applicants:", error);
        }
    };

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-8">
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <h1 className='font-bold text-lg sm:text-xl my-5'>Applicants ({applicants?.applications?.length})</h1>

                <div className='flex items-center justify-end my-5'>
                    <Button onClick={handleRankApplicants} className="hover-#2C2C3E-500 w-full sm:w-auto">
                        Rank Applicants
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <ApplicantsTable
                        applicants={showRanking ? rankedApplicants : applicants?.applications}
                        showRanking={showRanking}
                    />
                </div>
            </div>
        </div>
    );
};

export default Applicants;
