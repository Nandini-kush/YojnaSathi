import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Save,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormData {
  name: string;
  age: number | "";
  income: number | "";
  gender: string;
  caste: string;
  state: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: "",
    income: "",
    gender: "",
    caste: "",
    state: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await userAPI.getProfile();
      const data = res.data;
      setFormData({
        name: data.name || "",
        age: data.age || "",
        income: data.income || "",
        gender: data.gender || "",
        caste: data.caste || "",
        state: data.state || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" || name === "income" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const calculateCompletion = () => {
    let fields = 0;
    if (formData.name) fields++;
    if (formData.age !== "" && formData.age > 0) fields++;
    if (formData.income !== "") fields++;
    if (formData.gender) fields++;
    if (formData.caste) fields++;
    if (formData.state) fields++;
    return Math.round((fields / 6) * 100);
  };

  const completionPercentage = calculateCompletion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      return toast({
        title: "Validation Error",
        description: "Full Name is required.",
        variant: "destructive",
      });
    }

    try {
      setIsSaving(true);
      
      const payload = {
        name: formData.name,
        age: Number(formData.age) || 0,
        income: Number(formData.income) || 0,
        gender: formData.gender,
        caste: formData.caste,
        state: formData.state,
      };

      await userAPI.updateProfile(payload);
      
      toast({
        title: "Profile Saved",
        description: "Your profile has been updated successfully.",
      });
      
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Failed to update profile.";
      toast({
        title: "Update Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-blue-100 mt-1 font-medium flex items-center gap-2">
                  <ShieldCheck size={16} /> Secure personal information
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Completion Progress */}
            <div className="mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800">Profile Completion</h3>
                  <p className="text-sm text-slate-500">Complete your profile to unlock all eligible schemes.</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    completionPercentage === 100 ? "bg-green-500" : "bg-blue-600"
                  }`}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. 25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Annual Income (₹)</label>
                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. 250000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Caste Category</label>
                  <select
                    name="caste"
                    value={formData.caste}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="ews">EWS</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">State / Region</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. Madhya Pradesh"
                    required
                  />
                </div>
              </div>

              {completionPercentage < 100 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Please fill out all fields to ensure accurate scheme recommendations.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={18} /> Save Profile</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
