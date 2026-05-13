import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/context/authStore";
import { authAPI, apiDiagnostics } from "@/api";
import logo from "@/assets/yojnasathi_logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await authAPI.login(email, password);
      
      if (response && response.access_token) {
        setToken(response.access_token);
        
        const loggedInUser = {
          email,
          name: response.user?.name || email.split('@')[0],
          role: response.user?.role || (response.user?.is_admin ? 'admin' : 'user'),
          is_admin: response.user?.is_admin || response.user?.role === 'admin'
        };
        setUser(loggedInUser);

        toast({
          title: "Login Successful!",
          description: "Redirecting to your dashboard...",
        });

        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message ||
                           error.message ||
                           "Login failed. Please check your credentials.";
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("demo@example.com");
    setPassword("password123");
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Left Panel - Premium Branding */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[0%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        {/* Branding Content */}
        <div className="relative z-10 w-full max-w-lg text-white space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium tracking-wide">Secure Government Portal</span>
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1]">
              Unlock your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                entitlements.
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
              Access the most comprehensive database of government schemes tailored specifically to your profile.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-5"
          >
            {[
              "Check eligibility for 100+ schemes instantly",
              "ML-powered personalized recommendations",
              "Bank-grade security and data privacy"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 text-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 xl:p-24 bg-white relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-8">
             <img src={logo} alt="YojnaSathi" className="h-16 w-auto" />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                <span className="text-sm font-medium text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Banner */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">Demo Account</p>
              <p className="text-sm text-blue-800/80">Use demo credentials to quickly access the dashboard.</p>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Use Demo
            </button>
          </div>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => apiDiagnostics.checkStatus()}
              className="w-full text-xs font-medium text-slate-500 hover:text-slate-800 py-2 transition-colors"
            >
              🔧 Check API Status
            </button>
          )}

          <p className="text-center text-sm font-medium text-slate-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 transition-colors font-semibold"
            >
              Create free account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
