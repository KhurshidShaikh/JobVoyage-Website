import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8">
      <Navbar />
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-6 sm:my-10'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 my-5'>
          <Input
            className="flex-1"
            placeholder="Search by Company Name and Job Role"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/jobs/create")} className="w-full sm:w-auto">New Jobs</Button>
        </div>
        <div className="overflow-x-auto">
          <AdminJobsTable />
        </div>
      </div>
    </div>
  )
}

export default AdminJobs