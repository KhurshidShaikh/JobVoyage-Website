import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salaryMin: 0, // Numeric default
        salaryMax: 50, // Numeric default
        location: "",
        jobType: "",
        experience: "",
        position: "",
        companyId: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { companies } = useSelector(store => store.company);

    const SALARY_MAX = 50;

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        console.log(`Change event - ${name}: ${value}`); // Debug input changes
        if (['experience', 'position'].includes(name)) {
            if (value === '' || /^\d+$/.test(value)) {
                setInput({ ...input, [name]: value });
            }
        } else if (['salaryMin', 'salaryMax'].includes(name)) {
            const numValue = parseInt(value, 10); // Explicit base 10
            if (isNaN(numValue)) {
                console.warn(`${name} parsed to NaN, using 0`);
                setInput({ ...input, [name]: name === 'salaryMin' ? 0 : SALARY_MAX });
            } else if (name === 'salaryMin' && numValue <= input.salaryMax && numValue >= 0) {
                setInput({ ...input, [name]: numValue });
            } else if (name === 'salaryMax' && numValue >= input.salaryMin && numValue <= SALARY_MAX) {
                setInput({ ...input, [name]: numValue });
            }
        } else {
            setInput({ ...input, [name]: value });
        }
    };

    const selectChangeHandler = (name) => (value) => {
        if (name === 'companyId') {
            const selectedCompany = companies.find((company) => company.name.toLowerCase() === value);
            setInput({ ...input, companyId: selectedCompany?._id || '' });
        } else {
            setInput({ ...input, [name]: value });
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.jobType) {
            toast.error("Please select a job type");
            return;
        }
        if (!input.experience || parseInt(input.experience) < 0) {
            toast.error("Please enter a valid experience level (0 or more years)");
            return;
        }
        if (!input.position || parseInt(input.position) < 1) {
            toast.error("Please enter a valid number of positions (1 or more)");
            return;
        }
        if (input.salaryMin > input.salaryMax) {
            toast.error("Minimum salary cannot exceed maximum salary");
            return;
        }

        // Ensure numbers and log them
        const min = parseInt(input.salaryMin, 10);
        const max = parseInt(input.salaryMax, 10);
        console.log(`salaryMin: ${min}, salaryMax: ${max}`);

        if (isNaN(min) || isNaN(max)) {
            toast.error("Invalid salary range detected");
            return;
        }

        const salary = min === max ? `${min}` : `${min}-${max}`;
        console.log(`Constructed salary: ${salary}`);

        const payload = {
            ...input,
            salary
        };
        delete payload.salaryMin;
        delete payload.salaryMax;

        console.log('Payload being sent:', payload);

        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            console.error('Error posting job:', error);
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '100px' }}>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-2'>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Salary Range (LPA)</Label>
                            <div className="my-1">
                                <div className="flex justify-between mb-2">
                                    <span>{input.salaryMin} LPA</span>
                                    <span>{input.salaryMax} LPA</span>
                                </div>
                                <input
                                    type="range"
                                    name="salaryMin"
                                    min="0"
                                    max={SALARY_MAX}
                                    value={input.salaryMin}
                                    onChange={changeEventHandler}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <input
                                    type="range"
                                    name="salaryMax"
                                    min="0"
                                    max={SALARY_MAX}
                                    value={input.salaryMax}
                                    onChange={changeEventHandler}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <Select onValueChange={selectChangeHandler('jobType')} value={input.jobType}>
                                <SelectTrigger className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1">
                                    <SelectValue placeholder="Select Job Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                                        <SelectItem value="Intern">Intern</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Experience Level (Years)</Label>
                            <Input
                                type="number"
                                name="experience"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                min="0"
                                placeholder="e.g., 2"
                            />
                        </div>
                        <div>
                            <Label>Number of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                min="1"
                                placeholder="e.g., 2"
                            />
                        </div>
                        {companies.length > 0 && (
                            <div>
                                <Label>Company</Label>
                                <Select onValueChange={selectChangeHandler('companyId')}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {companies.map((company) => (
                                                <SelectItem key={company._id} value={company?.name?.toLowerCase()}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <Button className="w-full my-4">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full my-4">Post New Job</Button>
                    )}
                    {companies.length === 0 && (
                        <p className='text-xs text-red-600 font-bold text-center my-3'>
                            *Please register a company first, before posting a job
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostJob;