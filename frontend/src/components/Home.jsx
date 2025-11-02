import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Footer from './shared/Footer';
import axios from 'axios';
import { toast } from 'sonner';
import { Avatar, AvatarImage } from './ui/avatar';
import Navbar from './shared/Navbar';
import { Search } from 'lucide-react';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { setSearchedQuery, setAllJobs } from '@/redux/jobSlice';
import Chatbot from './ui/Chatbot';
import CompanyLogo from './CompanyLogo';
import SearchSuggestions from './SearchSuggestions';
import { setSearchCompanyByText } from '@/redux/companySlice';
import useGetRecommendations from '@/hooks/useGetRecommendations';

const HeroSection = () => {
    const [jobQuery, setJobQuery] = useState("");
    // const [companyQuery, setCompanyQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchHandler = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/job/search', {
                params: {
                    role: jobQuery,
                    location: locationQuery,
                }
            });

            const jobs = response.data;

            if (jobs.length > 0) {
                dispatch(setAllJobs(jobs));
                navigate("/browse");
            } else {
                toast.error("Job not found.");
            }

            if (jobQuery) {
                dispatch(setSearchedQuery(jobQuery));
            }

            if (locationQuery) {
                dispatch(setSearchedQuery(locationQuery));
            }

        } catch (error) {
            toast.error("Search failed. Try again later.");
            console.error(error);
        }
    };


    return (
        <div className='text-center px-4'>
            <div className='flex flex-col gap-5 my-8 sm:my-10'>
                <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold leading-tight'>
                    Find Your Dream Jobs<br />
                    With <span className='text-[dodgerblue]'>Job Voyage</span>
                </h1>

                {/* Desktop Search Bar */}
                <div className="hidden sm:flex items-center w-full max-w-2xl mx-auto bg-white shadow-md rounded-full py-3 pl-6 pr-2 border border-gray-300">
                    <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />

                    <div className="relative flex-1 min-w-0">
                        <input
                            type="text"
                            placeholder="Enter role"
                            value={jobQuery}
                            onChange={(e) => setJobQuery(e.target.value)}
                            className="outline-none border-none text-gray-500 placeholder-gray-400 bg-transparent px-3 py-2 text-base w-full"
                        />
                        <SearchSuggestions query={jobQuery} type="job" onSelect={setJobQuery} />
                    </div>

                    <div className="border-l border-gray-300 h-6 mx-2"></div>

                    <div className="relative flex-1 min-w-0">
                        <input
                            type="text"
                            placeholder="Enter location"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            className="outline-none border-none text-gray-500 placeholder-gray-400 bg-transparent px-3 py-2 text-base w-full"
                        />
                        <SearchSuggestions query={locationQuery} type="location" onSelect={setLocationQuery} />
                    </div>

                    <Button onClick={searchHandler} className="bg-blue-500 text-white px-6 py-2 rounded-full text-base font-medium ml-2 flex-shrink-0">
                        Search
                    </Button>
                </div>
                
                {/* Mobile Search Bars - Stacked */}
                <div className="sm:hidden w-full max-w-2xl mx-auto space-y-3">
                    {/* Role Input */}
                    <div className="flex items-center bg-white shadow-md rounded-full py-3 pl-4 pr-4 border border-gray-300">
                        <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="relative flex-1 min-w-0">
                            <input
                                type="text"
                                placeholder="Enter role"
                                value={jobQuery}
                                onChange={(e) => setJobQuery(e.target.value)}
                                className="outline-none border-none text-gray-500 placeholder-gray-400 bg-transparent px-3 py-2 text-sm w-full"
                            />
                            <SearchSuggestions query={jobQuery} type="job" onSelect={setJobQuery} />
                        </div>
                    </div>
                    
                    {/* Location Input */}
                    <div className="flex items-center bg-white shadow-md rounded-full py-3 pl-4 pr-4 border border-gray-300">
                        <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="relative flex-1 min-w-0">
                            <input
                                type="text"
                                placeholder="Enter location"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                className="outline-none border-none text-gray-500 placeholder-gray-400 bg-transparent px-3 py-2 text-sm w-full"
                            />
                            <SearchSuggestions query={locationQuery} type="location" onSelect={setLocationQuery} />
                        </div>
                    </div>
                    
                    {/* Search Button */}
                    <Button onClick={searchHandler} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-base font-medium w-full">
                        Search Jobs
                    </Button>
                </div>
            </div>
        </div>
    );
};

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    const logoUrl = job?.company?.logo ? `http://localhost:5000${job.company.logo}` : 'https://via.placeholder.com/40';
    console.log("Job Data:", job);

    const handleWebsiteClick = (event) => {
        event.stopPropagation();
    };

    return (
        <div
            onClick={() => navigate(`/description/${job._id}`)}
            className='p-4 sm:p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-200' >
            <div className='flex items-center gap-2 sm:gap-3 my-2'>
                <Button className="p-4 sm:p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={logoUrl} alt="Company Logo" />
                    </Avatar>
                </Button>
                <div className='flex-1 min-w-0'>
                    <h1 className='font-medium text-base sm:text-lg truncate'>{job?.company?.name || 'Unknown'}</h1>
                    <p className='text-xs sm:text-sm text-gray-500'>
                        {job?.company?.website && (
                            <a
                                href={job?.company?.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                                onClick={handleWebsiteClick}
                            >
                                Website
                            </a>
                        )}
                    </p>
                </div>
            </div>
            <div className='mb-3'>
                <h1 className='font-bold text-base sm:text-lg my-2 truncate'>{job?.title}</h1>
                <p className='text-xs sm:text-sm text-gray-600 line-clamp-2'>{job?.description}</p>
            </div>
            <div className='flex flex-wrap gap-1 sm:gap-2 mt-3 mb-4'>
                <Badge className={'text-blue-700 font-bold text-xs'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#F83002] font-bold text-xs'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#7209b7] font-bold text-xs'} variant="ghost">{job?.salary}LPA</Badge>
            </div>
        </div>
    );
};


const LatestJobs = () => {
    const { homepageJobs, recommendedJobs, loading } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);

    console.log('homepageJobs in LatestJobs:', homepageJobs);

    return (
        <div className='max-w-6xl mx-auto my-12 sm:my-16 lg:my-20 px-4'>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8'>
                <span className='text-[dodgerblue]'>Latest </span> Job Openings
            </h1>
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : Array.isArray(homepageJobs) && homepageJobs.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-5'>
                    {homepageJobs.slice(0, 6).map((job) => <LatestJobCards key={job._id} job={job} />)}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No Job Available
                </div>
            )}
            
            {user?.role === 'Job Seeker' && (
                <>
                   
                </>
            )}
        </div>
    );
};

const Home = () => {
    useGetAllJobs(true);
    useGetRecommendations();
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'Employer') {
            navigate("/admin/companies");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="pt-16 sm:pt-20">
                <HeroSection />
                <CompanyLogo />
                <LatestJobs />
                <Footer />
                <Chatbot />
            </div>
        </div>
    );
};

export default Home;