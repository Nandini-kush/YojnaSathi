import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Users,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/context/authStore";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/yojnasathi_logo.png";

interface AdminStats {
  total_users: number;
  total_schemes: number;
  active_schemes: number;
  total_eligibility_checks: number;
  unique_categories: number;
  growth_percentage: number;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface RecentCheck {
  id: number;
  user_id: number;
  user_name: string;
  age: number;
  income: number;
  gender: string;
  /* is_student removed */
  eligible_count: number;
  created_at: string;
}

interface Scheme {
  id: number;
  scheme_name: string;
  category: string;
  min_age: number | null;
  max_age: number | null;
  max_income: number | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentChecks, setRecentChecks] = useState<RecentCheck[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("schemes");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Load stats
        const statsResponse = await adminAPI.getStats();
        if (statsResponse.data) {
          setStats(statsResponse.data);
        }

        // Load recent users
        const usersResponse = await adminAPI.getRecentUsers(10);
        if (usersResponse.data) {
          setRecentUsers(usersResponse.data);
        }

        // Load recent eligibility checks
        const checksResponse = await adminAPI.getRecentEligibilityChecks(10);
        if (checksResponse.data) {
          setRecentChecks(checksResponse.data);
        }

        // Load all schemes
        const schemesResponse = await adminAPI.getAllSchemes();
        if (schemesResponse.data) {
          setAllSchemes(schemesResponse.data);
        }
      } catch (error) {
        console.error("Error loading admin dashboard:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredSchemes = allSchemes.filter((scheme) =>
    scheme.scheme_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/admin")}>
            <img src={logo} alt="YojnaSathi Logo" className="h-10 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-slate-300 font-medium">Admin User</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Users Card */}
            <motion.div
              whileHover={{ translateY: -4 }}
              className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.total_users}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            {/* Total Schemes Card */}
            <motion.div
              whileHover={{ translateY: -4 }}
              className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-xl p-6 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">
                    Total Schemes
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.total_schemes}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            {/* Active Schemes Card */}
            <motion.div
              whileHover={{ translateY: -4 }}
              className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">
                    Active Schemes
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.active_schemes}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <CheckCircle2 className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </motion.div>

            {/* Growth Card */}
            <motion.div
              whileHover={{ translateY: -4 }}
              className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-500/30 rounded-xl p-6 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-white">
                    +{stats.growth_percentage}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tabs and Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur p-6"
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-700">
            <button
              onClick={() => setActiveTab("schemes")}
              className={`pb-4 px-4 font-medium text-sm transition-colors ${
                activeTab === "schemes"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              All Government Schemes
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-4 px-4 font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Recent Users
            </button>
            <button
              onClick={() => setActiveTab("checks")}
              className={`pb-4 px-4 font-medium text-sm transition-colors ${
                activeTab === "checks"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Eligibility Checks
            </button>
          </div>

          {/* Schemes Tab */}
          {activeTab === "schemes" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Scheme Name
                      </th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Min Age
                      </th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Max Age
                      </th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Income Limit
                      </th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchemes.length > 0 ? (
                      filteredSchemes.map((scheme) => (
                        <tr
                          key={scheme.id}
                          className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-white font-medium">
                            {scheme.scheme_name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                              {scheme.category || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {scheme.min_age ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {scheme.max_age ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {scheme.max_income
                              ? `₹${scheme.max_income.toLocaleString()}`
                              : "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                scheme.is_active
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {scheme.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No schemes found matching your search
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">
                          {user.name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{user.email}</td>
                        <td className="py-3 px-4 text-slate-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Eligibility Checks Tab */}
          {activeTab === "checks" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      User Name
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Age
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Income
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Eligible Schemes
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentChecks.length > 0 ? (
                    recentChecks.map((check) => (
                      <tr
                        key={check.id}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">
                          {check.user_name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{check.age}</td>
                        <td className="py-3 px-4 text-slate-300">
                          ₹{check.income.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                            {check.eligible_count}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">
                          {new Date(check.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No eligibility checks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
