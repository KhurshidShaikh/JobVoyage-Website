import React, { useState } from "react";
import { LogOut, User2, Bookmark, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT, BACKEND_BASE_URL } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const Navbar = () => {
    const { user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, {
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(null));
                toast.success(res.data.message);

                setTimeout(() => {
                    window.location.href = "/";
                }, 1);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Logout failed!");
        }
    };

    // Get user initials for avatar
    const getUserInitials = (name) => {
        if (!name) return "U";
        const names = name.split(" ");
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div
            className="bg-white"
            style={{
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: "60px",
            }}
        >
            <div className="flex items-center justify-between mx-auto max-w-6xl h-16 px-4">
                <div className="flex items-center space-x-2">
                    <img src="/JobLogo.png" alt="JobVoyage Logo" className="h-6 w-6" />
                    <h1 className="text-xl sm:text-2xl font-bold">
                        Job<span className="text-[dodgerblue]">Voyage</span>
                    </h1>
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-12">
                    <ul className="flex font-medium items-center gap-5">
                        {user && user.role === "Employer" ? (
                            <>
                                <li>
                                    <Link to="/admin/companies">Companies</Link>
                                </li>
                                <li>
                                    <Link to="/admin/jobs">Jobs</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/">Home</Link>
                                </li>
                                <li>
                                    <Link to="/jobs">Jobs</Link>
                                </li>
                                <li>
                                    <a href="/browse">Browse</a>
                                </li>
                                <li>
                                    <Link to="/bookmarks">Bookmarks</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    {!user ? (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <button className="border px-4 py-2 rounded">
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="bg-[dodgerblue] hover:bg-[#5b30a6] text-white px-4 py-2 rounded">
                                    Signup
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {getUserInitials(user?.fullname)}
                                </div>
                                <span className="text-white font-medium text-sm hidden lg:block">
                                    {user?.fullname}
                                </span>
                            </div>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-gray-200">
                                    <div className="flex gap-3 p-4 border-b border-gray-100">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {getUserInitials(user?.fullname)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {user?.fullname}
                                            </h4>
                                            <p className="text-sm text-gray-600 truncate">
                                                {user?.profile?.bio || "No bio"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col my-2 px-4">
                                        {user && user.role === "Job Seeker" && (
                                            <>
                                                <div className="flex items-center gap-2 cursor-pointer mb-2 p-2 rounded hover:bg-gray-50">
                                                    <User2 className="w-4 h-4" />
                                                    <Link
                                                        to="/profile"
                                                        className="text-gray-700 hover:text-blue-600"
                                                    >
                                                        View Profile
                                                    </Link>
                                                </div>
                                                <div className="flex items-center gap-2 cursor-pointer mb-2 p-2 rounded hover:bg-gray-50">
                                                    <Bookmark className="w-4 h-4" />
                                                    <Link
                                                        to="/bookmarks"
                                                        className="text-gray-700 hover:text-blue-600"
                                                    >
                                                        My Bookmarks
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-red-50">
                                            <LogOut className="w-4 h-4" />
                                            <button
                                                onClick={logoutHandler}
                                                className="text-gray-700 hover:text-red-600"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
            
            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2">
                    <ul className="flex flex-col space-y-3 py-3">
                        {user && user.role === "Employer" ? (
                            <>
                                <li>
                                    <Link 
                                        to="/admin/companies" 
                                        className="block py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Companies
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/admin/jobs" 
                                        className="block py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Jobs
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link 
                                        to="/" 
                                        className="block py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/jobs" 
                                        className="block py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Jobs
                                    </Link>
                                </li>
                                <li>
                                    <a 
                                        href="/browse" 
                                        className="block py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Browse
                                    </a>
                                </li>
                                <li>
                                    <Link 
                                        to="/bookmarks" 
                                        className="block py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Bookmarks
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    
                    {!user ? (
                        <div className="flex flex-col space-y-2 py-3 border-t border-gray-200">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full border px-4 py-2 rounded">
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full bg-[dodgerblue] hover:bg-[#5b30a6] text-white px-4 py-2 rounded">
                                    Signup
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="py-3 border-t border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {getUserInitials(user?.fullname)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{user?.fullname}</h4>
                                    <p className="text-sm text-gray-600 truncate">{user?.profile?.bio || "No bio"}</p>
                                </div>
                            </div>
                            
                            {user && user.role === "Job Seeker" && (
                                <div className="space-y-2">
                                    <Link 
                                        to="/profile" 
                                        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User2 className="w-4 h-4" />
                                        View Profile
                                    </Link>
                                    <Link 
                                        to="/bookmarks" 
                                        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Bookmark className="w-4 h-4" />
                                        My Bookmarks
                                    </Link>
                                </div>
                            )}
                            
                            <button
                                onClick={() => {
                                    logoutHandler();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-2 w-full py-2 px-3 rounded-md hover:bg-gray-100 text-red-600"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;
