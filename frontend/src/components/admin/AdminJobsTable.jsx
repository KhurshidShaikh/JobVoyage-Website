import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Eye, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteJob } from '@/redux/jobSlice';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const [filterJobs, setFilterJobs] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'Employer') {
            const employerJobs = allAdminJobs.filter((job) => job.created_by === user._id);

            const filteredJobs = employerJobs.filter((job) => {
                if (!searchJobByText) {
                    return true;
                }
                return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
                    job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());
            });

            setFilterJobs(filteredJobs);
        }
    }, [allAdminJobs, searchJobByText, user]);

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                const res = await axios.delete(`${JOB_API_END_POINT}/delete/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(deleteJob(jobId));
                }
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of your recently posted jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead style={{ backgroundColor: '#bbdefb', color: 'black', padding: '10px', textAlign: 'left' }}>Company Name</TableHead>
                        <TableHead style={{ backgroundColor: '#bbdefb', color: 'black', padding: '10px', textAlign: 'left' }}>Role</TableHead>
                        <TableHead style={{ backgroundColor: '#bbdefb', color: 'black', padding: '10px', textAlign: 'left' }}>Location</TableHead>
                        <TableHead style={{ backgroundColor: '#bbdefb', color: 'black', padding: '10px', textAlign: 'left' }}>Date</TableHead>
                        <TableHead style={{ backgroundColor: '#bbdefb', color: 'black', padding: '10px', textAlign: 'left' }}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.map((job) => {
                            const companyLogo = job?.company?.logo
                                ? `http://localhost:5000${job.company.logo}`
                                : "/default-company-logo.png";

                            return (
                                <TableRow key={job._id}>
                                    <TableCell className="flex items-center gap-2">
                                        <img src={companyLogo} alt="Company Logo" className="w-10 h-10 rounded-full object-cover border" />
                                        <span>{job?.company?.name}</span>
                                    </TableCell>
                                    <TableCell>{job?.title}</TableCell>
                                    <TableCell>{job?.location}</TableCell>
                                    <TableCell>{job?.createdAt.split("T")[0]}</TableCell>
                                    <TableCell className="text-right">
                                        <div className='flex items-center justify-start gap-4'>
                                            <div
                                                onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                                                className='flex items-center w-fit gap-2 cursor-pointer'
                                            >
                                                <Eye className='w-4 text-blue-500' />
                                                <span>Applicants</span>
                                            </div>
                                            <div
                                                onClick={() => handleDeleteJob(job._id)}
                                                className='flex items-center w-fit gap-2 cursor-pointer text-black-500 hover:text-red-700'
                                            >
                                                <Trash2 className='w-4 text-red-500' />
                                                <span>Delete</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    }
                </TableBody>
            </Table>
        </div>
    );
};

export default AdminJobsTable;