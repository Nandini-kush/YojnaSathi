import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  LogOut,
  User,
  Zap,
  FileText,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useAuthStore } from "@/context/authStore";
import { userAPI, mlAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/yojnasathi_logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  // State declarations - all hooks at top
  const [userName, setUserName] = useState<string>("User");
  const [isLoading, setIsLoading] = useState(true);
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    age: number;
    income: number;
    gender: string;
    category: string;
  } | null>(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        if (user?.name) {
          setUserName(user.name);
        } else {
          try {
            const response = await userAPI.getProfile();
            if (response.data?.name) {
              setUserName(response.data.name);
            }
          } catch (err) {
            setUserName(user?.name || "User");
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle eligibility check form submission
  const handleEligibilityCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!age || !income || !gender || !category) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);
      const ageNum = parseInt(age);
      const incomeNum = parseInt(income);

      // Store user profile data (form data)
      const profileData = {
        age: ageNum,
        income: incomeNum,
        gender,
        category,
      };
      setUserProfile(profileData);

      console.log("📤 Calling /ml/recommend with:", profileData);

      // Call ML recommendation endpoint (POST /ml/recommend)
      // This endpoint expects: age, income (annual), gender, category
      const mlResponse = await mlAPI.recommend(profileData);
      
      console.log("✅ ML recommend response:", mlResponse.data);

      if (mlResponse.data?.recommended_schemes) {
        setRecommendedSchemes(mlResponse.data.recommended_schemes);
      } else if (mlResponse.data) {
        setRecommendedSchemes(Array.isArray(mlResponse.data) ? mlResponse.data : []);
      }

      toast({
        title: "Success",
        description: "Eligibility check and recommendations completed!",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to check eligibility";
      setApiError(errorMessage);
      console.error("❌ Error checking eligibility:", error);
      console.error("Full error response:", error.response);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Main render - single return statement with complete JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/dashboard")}>
            <img src={logo} alt="YojnaSathi Logo" className="h-10 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Welcome Section */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {userName}!
            </h2>
            <p className="text-gray-600">
              Check your eligibility and get personalized scheme recommendations
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-white rounded-2xl border-t-4 border-blue-600 shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
            </div>

            {userProfile ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-lg font-semibold text-gray-900">{userProfile.age} years</p>
                </div>
                <div className="pb-4 border-b border-gray-200">
                  <label className="text-sm font-medium text-gray-600">Annual Income</label>
                  <p className="text-lg font-semibold text-gray-900">₹{userProfile.income.toLocaleString('en-IN')}</p>
                </div>
                <div className="pb-4 border-b border-gray-200">
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{userProfile.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-lg font-semibold text-gray-900 uppercase">{userProfile.category}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-gray-600 text-center">
                  Submit your details to see your profile summary
                </p>
              </div>
            )}
          </motion.div>

          {/* Eligibility Check Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl border-t-4 border-purple-600 shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Check Your Eligibility</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Enter your details to get ML-powered scheme recommendations
            </p>

            <form onSubmit={handleEligibilityCheck} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={isSubmitting}
                    min="0"
                    max="120"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Annual Income (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="Enter annual income"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={isSubmitting}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select category</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Check Eligibility & Get Recommendations
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border-t-4 border-green-600 shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Scheme Recommendations</h3>
          </div>

          <p className="text-gray-600 mb-8">
            Submit your details above to receive ML-powered scheme recommendations
          </p>

          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={32} className="text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Analyzing your profile and finding recommendations...</p>
            </div>
          ) : !userProfile ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Analyze</h4>
              <p className="text-gray-600 text-center max-w-md">
                Your personalized scheme recommendations will appear here after you submit your details
              </p>
            </div>
          ) : apiError ? (
            <div className="flex flex-col items-center justify-center py-8 bg-red-50 rounded-lg border border-red-200 p-6">
              <p className="text-red-600 text-center font-semibold mb-2">Error fetching recommendations</p>
              <p className="text-red-500 text-sm">{apiError}</p>
            </div>
          ) : recommendedSchemes.length > 0 ? (
            <div className="space-y-4">
              {recommendedSchemes.map((scheme, index) => (
                <motion.div
                  key={scheme.scheme_id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{scheme.scheme_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-1 rounded">
                        {scheme.eligible ? "Eligible" : "Not Eligible"}
                      </span>
                      {scheme.probability && (
                        <span className="text-xs text-gray-600">
                          Match: {(scheme.probability * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-600">No schemes found matching your criteria</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 text-white py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={24} />
            <span className="font-bold">YojnaSathi</span>
          </div>
          <p className="text-sm text-gray-400">
            Made with ❤️ for Indian Citizens • © 2026 YojnaSathi
          </p>
        </div>
      </footer>
    </div>
  );
}
