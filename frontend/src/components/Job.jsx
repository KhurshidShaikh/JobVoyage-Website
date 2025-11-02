import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import BookmarkButton from './ui/BookmarkButton';

const Job = ({ job }) => {
    const navigate = useNavigate();
    const logoUrl = job?.company?.logo ? `http://localhost:5000${job.company.logo}` : '/default-logo.png';

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    return (
        <div className='p-4 sm:p-5 rounded-md shadow-xl bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-200'>
            <div className='flex items-center justify-between mb-3'>
                <p className='text-xs sm:text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                <BookmarkButton jobId={job?._id} />
            </div>

            <div className='flex items-center gap-2 sm:gap-3 my-2'>
                <Button className="p-4 sm:p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={logoUrl} alt="Company Logo" />
                    </Avatar>
                </Button>
                <div className='flex-1 min-w-0'>
                    <h1 className='font-medium text-base sm:text-lg truncate'>{job?.company?.name}</h1>
                    <p className='text-xs sm:text-sm text-gray-500'>
                        {job?.company?.website ? (
                            <a
                                href={job?.company?.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Website
                            </a>
                        ) : (
                            'Unknown'
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
            
            <div className='flex justify-center sm:justify-start mt-4'>
                <Button className={'text-[white] bg-[royalblue] font-bold text-sm sm:text-base px-4 sm:px-6 py-2 w-full sm:w-auto'} onClick={() => navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
            </div>
        </div>
    )
}

export default Job;
