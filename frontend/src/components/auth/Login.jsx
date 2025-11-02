import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        
        // Validate inputs before making API call
        if (!input.email || !input.password || !input.role) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
                timeout: 10000 // 10 second timeout
            });
            
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            if (error.code === 'ECONNABORTED') {
                toast.error("Request timeout. Please check your connection.");
            } else if (error.response) {
                toast.error(error.response.data?.message || "Login failed");
            } else if (error.request) {
                toast.error("Cannot connect to server. Please check if backend is running.");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-8">
            <Navbar /> {/* Navbar is included here */}
            <div className='flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6'>
                <form onSubmit={submitHandler} className='w-full sm:w-3/4 md:w-2/3 lg:w-1/2 border border-gray-200 rounded-md p-4 sm:p-6 my-6 sm:my-10'>
                    <h1 className='font-bold text-xl mb-5'>Login</h1>
                    
                    <div className='my-2'>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="Enter your email"
                            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>

                    <div className='my-2'>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="********"
                            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className='my-5'>
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            name="role"
                            value={input.role}
                            onChange={changeEventHandler}
                            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            <option value="">Select Role</option>
                            <option value="Job Seeker">Job Seeker</option>
                            <option value="Employer">Employer</option>
                        </select>
                    </div>

                    {
                        loading ? (
                            <button type="button" className="w-full my-4 flex items-center justify-center bg-blue-600 text-white rounded-md h-10">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait 
                            </button>
                        ) : (
                            <button type="submit" className="w-full my-4 bg-blue-600 text-white rounded-md h-10">
                                Login
                            </button>
                        )
                    }
                    
                    <span className='text-sm'>Don't have an account? <Link to="/signup" className='text-blue-600'>Signup</Link></span>
                </form>
            </div>
        </div>
    );
}

export default Login;
