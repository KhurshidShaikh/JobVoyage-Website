import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import useGetCompanyById from "@/hooks/useGetCompanyById";

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const navigate = useNavigate();
    const { singleCompany } = useSelector(store => store.company);

    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ Define logoUrl in the component body
    const logoUrl = singleCompany?.logo
        ? `http://localhost:5000${singleCompany.logo}`
        : "/default-avatar.png";

    useEffect(() => {
        setInput({
            name: singleCompany?.name || "",
            description: singleCompany?.description || "",
            website: singleCompany?.website || "",
            location: singleCompany?.location || "",
            file: null
        });
    }, [singleCompany]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, file });

            // ✅ Show preview for new image
            const fileReader = new FileReader();
            fileReader.onload = () => setPreview(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);

        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-8">
            <Navbar />
            <div className="max-w-xl mx-auto px-4 sm:px-6 my-6 sm:my-10 bg-white p-4 sm:p-6 lg:p-8 shadow-md rounded-lg">
                <form onSubmit={submitHandler}>
                    <div className="flex items-center gap-3 sm:gap-5 pb-4 sm:pb-6 border-b">
                        <Button onClick={() => navigate("/admin/companies")} variant="outline" className="flex items-center gap-2 text-gray-500 font-semibold text-sm sm:text-base">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <h1 className="font-bold text-lg sm:text-xl">Company Setup</h1>
                    </div>

                    <div className="grid grid-cols-1 gap-4 my-6">
                        <div>
                            <Label>Company Name</Label>
                            <Input type="text" name="name" value={input.name} onChange={changeEventHandler} required />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input type="text" name="description" value={input.description} onChange={changeEventHandler} required />
                        </div>
                        <div>
                            <Label>Website</Label>
                            <Input type="text" name="website" value={input.website} onChange={changeEventHandler} required />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input type="text" name="location" value={input.location} onChange={changeEventHandler} required />
                        </div>
                        <div>
                            <Label>Logo</Label>
                            <Input type="file" accept="image/*" onChange={changeFileHandler} />
                            {/* ✅ Show preview of current logo if no new image is uploaded */}
                            <div className="mt-3">
                                <p className="text-sm text-gray-500">Current Logo:</p>
                                <img src={preview || logoUrl} alt="Company Logo" className="w-32 h-32 object-cover border rounded-md" />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                       Update
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CompanySetup;
