import React, { useState } from 'react';
import Navbar from './shared/Navbar';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Contact, Mail, Pen } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';
import { useSelector } from 'react-redux';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import { BACKEND_BASE_URL } from '@/utils/constant';

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    const profilePhotoUrl = user?.profile?.profilePhoto
        ? `${BACKEND_BASE_URL}${user.profile.profilePhoto}`
        : "/default-avatar.png";

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-8">
            <Navbar />
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='bg-white border border-gray-200 rounded-2xl my-5 p-4 sm:p-6 lg:p-8'>
                    <div className='flex flex-col sm:flex-row justify-between gap-4'>
                        <div className='flex items-center gap-3 sm:gap-4'>
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 flex-shrink-0">
                                <AvatarImage src={profilePhotoUrl} alt="profile" />
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h1 className='font-medium text-lg sm:text-xl truncate'>{user?.fullname}</h1>
                                <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{user?.profile?.bio || "No bio available"}</p>
                            </div>
                        </div>
                        <Button onClick={() => setOpen(true)} className="self-start sm:self-center" variant="outline" size="sm">
                            <Pen className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className='my-5 space-y-3'>
                        <div className='flex items-center gap-3 my-2'>
                            <Mail className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm sm:text-base break-all">{user?.email || "No email provided"}</span>
                        </div>
                        <div className='flex items-center gap-3 my-2'>
                            <Contact className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm sm:text-base">{user?.phoneNumber || "No phone number available"}</span>
                        </div>
                    </div>
                    <div className='my-5'>
                        <h1 className="font-semibold mb-2">Skills</h1>
                        <div className='flex flex-wrap items-center gap-2'>
                            {user?.profile?.skills?.length > 0
                                ? user.profile.skills.map((item, index) => (
                                      <Badge key={index} className="text-xs sm:text-sm">{item}</Badge>
                                  ))
                                : <span className="text-gray-500">NA</span>}
                        </div>
                    </div>
                    <div className='grid w-full items-center gap-1.5'>
                        <Label className="text-sm sm:text-md font-bold">Resume</Label>
                        {user?.profile?.resume ? (
                            <a target='_blank' rel="noopener noreferrer" href={`${BACKEND_BASE_URL}${user.profile.resume}`} className='text-blue-500 hover:underline cursor-pointer text-sm sm:text-base break-all'>
                                {user.profile.resumeOriginalName || "View Resume"}
                            </a>
                        ) : (
                            <span className="text-gray-500">NA</span>
                        )}
                    </div>
                </div>
                <div className='bg-white rounded-2xl p-4 sm:p-6'>
                    <h1 className='font-bold text-base sm:text-lg my-5'>Applied Jobs</h1>
                    <div className="overflow-x-auto">
                        <AppliedJobTable />
                    </div>
                </div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
}

export default Profile;
