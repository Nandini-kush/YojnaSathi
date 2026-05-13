import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Zap,
  FileText,
  Loader2,
  CheckCircle,
  Briefcase,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Menu,
  ArrowRight,
  X,
  Settings
} from "lucide-react";
import { useAuthStore } from "@/context/authStore";
import { userAPI, schemesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage } from "@/lib/errorHandler";
import { SchemeRecommendation } from "@/types/api";
import logo from "@/assets/yojnasathi_logo.png";

interface UserProfile {
  age: number;
  income: number;
  gender: string;
  caste: string;
  state: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const [userName, setUserName] = useState<string>("User");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  
  const [recommendedSchemes, setRecommendedSchemes] = useState<SchemeRecommendation[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      const response = await userAPI.getProfile();
      const data = response.data;
      
      if (data?.name) {
        setUserName(data.name);
      } else if (user?.name) {
        setUserName(user.name);
      }

      const profileComplete = data && data.age > 0 && data.gender && data.caste && data.state;
      
      if (!profileComplete) {
        setIsProfileIncomplete(true);
        setUserProfile(null);
      } else {
        setIsProfileIncomplete(false);
        setUserProfile({
          age: data.age,
          income: data.income,
          gender: data.gender,
          caste: data.caste,
          state: data.state
        });
        
        // Auto-fetch schemes if profile is complete
        fetchSchemes();
      }
      
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsProfileIncomplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      setIsRefreshing(true);
      setApiError(null);
      
      const schemesList = await schemesAPI.getEligible({} as any); // params are ignored in updated lib/api.ts or by backend

      const schemes = schemesList.map((s: any) => ({
        id: s.id,
        name: s.scheme_name || s.name || s.schemeName || 'Untitled Scheme',
        eligible: true,
        score: s.score || 0,
        raw: s,
      }));

      setRecommendedSchemes(schemes);
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      setApiError(errorMessage);
      setRecommendedSchemes([]);
      
      toast({
        title: "Error fetching schemes",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Premium Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <img src={logo} alt="YojnaSathi Logo" className="h-8 w-auto" />
              <span className="font-bold text-lg text-slate-900 hidden sm:block">YojnaSathi Dashboard</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/profile")}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Settings size={16} />
                Profile
              </button>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>

            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Citizen Profile</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-full text-left text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings size={16} />
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {isProfileIncomplete && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600 mt-1">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Incomplete Profile</h3>
                <p className="text-amber-800 text-sm mt-1">
                  Please complete your profile to see accurate and personalized government scheme eligibility matches.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="whitespace-nowrap px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              Complete Profile
            </button>
          </motion.div>
        )}

        {/* Welcome & Stats Row */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {userName}</h1>
            <p className="text-slate-600">Here's your government schemes portal overview.</p>
          </div>
          {!isProfileIncomplete && (
            <button
              onClick={fetchSchemes}
              disabled={isRefreshing}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <Zap size={16} className={isRefreshing ? "animate-pulse text-blue-600" : "text-blue-600"} />
              Refresh Matches
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Schemes</p>
              <p className="text-2xl font-bold text-slate-900">100+</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Eligible Matches</p>
              <p className="text-2xl font-bold text-slate-900">{recommendedSchemes.length}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Profile Status</p>
              <p className="text-2xl font-bold text-slate-900">{isProfileIncomplete ? 'Pending' : 'Analyzed'}</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recommendations Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Your Matches</h2>
                    <p className="text-sm text-slate-500">Schemes you are eligible for based on your profile.</p>
                  </div>
                </div>
              </div>

              {isRefreshing ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Scanning scheme database...</p>
                </div>
              ) : isProfileIncomplete ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <FileText size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium max-w-sm mb-4">Submit your details in your profile to reveal your personalized scheme matches.</p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
                  >
                    Go to Profile <ArrowRight size={16} />
                  </button>
                </div>
              ) : apiError ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Failed to fetch recommendations</p>
                    <p className="text-sm mt-1 opacity-90">{apiError}</p>
                  </div>
                </div>
              ) : recommendedSchemes.length > 0 ? (
                <div className="space-y-4">
                  {recommendedSchemes.map((scheme, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={scheme.id || idx}
                      onClick={() => navigate(`/scheme/${scheme.id}`)}
                      className="group p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                            Eligible
                          </span>
                          {typeof scheme.score === 'number' && scheme.score > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              Score: {scheme.score}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{scheme.name}</h4>
                        <p className="text-sm text-slate-500 mt-1">Ref ID: {scheme.id}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-slate-600 font-medium">No schemes found matching your specific criteria.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24"
            >
              <div className="bg-slate-900 px-6 py-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-800 relative z-10">
                  <User size={32} className="text-slate-400" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white relative z-10">{userName}</h3>
                <p className="text-slate-400 text-sm relative z-10">Citizen Profile</p>
                <button
                  onClick={() => navigate("/profile")}
                  className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-colors relative z-10 inline-flex items-center gap-1"
                >
                  <Settings size={14} /> Edit
                </button>
              </div>

              <div className="p-6">
                {!isProfileIncomplete && userProfile ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analyzed Details</h4>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Age</span>
                      <span className="font-semibold text-slate-900">{userProfile.age} yrs</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Income</span>
                      <span className="font-semibold text-slate-900">₹{userProfile.income.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Gender</span>
                      <span className="font-semibold text-slate-900 capitalize">{userProfile.gender}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Caste</span>
                      <span className="font-semibold text-slate-900 uppercase">{userProfile.caste}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-slate-500">State</span>
                      <span className="font-semibold text-slate-900 capitalize">{userProfile.state}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500 mb-4">Your profile is incomplete. We need your details to match schemes.</p>
                    <button
                      onClick={() => navigate("/profile")}
                      className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors w-full text-sm"
                    >
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 YojnaSathi. Designed for Indian Citizens.</p>
      </footer>
    </div>
  );
}
