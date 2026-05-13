import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, CheckSquare, Lightbulb, User, Search, CheckCircle, Zap, ArrowUpRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import logo from '@/assets/yojnasathi_logo.png';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // ===== HERO SECTION =====
  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Premium Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-10 w-full flex flex-col items-center"
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 border border-white shadow-sm backdrop-blur-md mb-4"
          >
            <img src={logo} alt="YojnaSathi" className="h-6 w-auto" />
            <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              YojnaSathi Platform 2.0
            </span>
          </motion.div>

          {/* Heading */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Your Gateway to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Government Schemes
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover, check eligibility, and get personalized recommendations for government schemes you're entitled to—instantly.
            </p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate('/register')}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto font-semibold text-white bg-slate-900 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <span className="relative z-10">Get Started Free</span>
              <ArrowUpRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all hover:shadow-sm"
            >
              <span>Login to Dashboard</span>
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 text-slate-500"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold text-slate-800">100+</span>
              <span className="text-sm font-medium uppercase tracking-wider">Active Schemes</span>
            </div>
            <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ML</span>
              <span className="text-sm font-medium uppercase tracking-wider">Powered Matching</span>
            </div>
            <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold text-slate-800">100%</span>
              <span className="text-sm font-medium uppercase tracking-wider">Free to Use</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  // ===== FEATURES SECTION =====
  const FeaturesSection = () => {
    const features = [
      {
        icon: Search,
        title: 'Smart Search',
        description: 'Quickly find schemes by category, eligibility criteria, or keyword. Our intelligent search makes finding the right scheme easy.',
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      {
        icon: CheckCircle,
        title: 'Instant Eligibility Check',
        description: 'Get instant results on scheme eligibility based on your age, income, education, and other criteria. No complex forms required.',
        color: 'from-indigo-500 to-indigo-600',
        bg: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
      },
      {
        icon: Zap,
        title: 'Real-Time Updates',
        description: 'Stay updated with the latest scheme changes, new launches, and eligibility updates. Never miss out on an opportunity.',
        color: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        iconColor: 'text-purple-600'
      },
      {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Your data is encrypted and protected. We never share your personal information with third parties.',
        color: 'from-pink-500 to-pink-600',
        bg: 'bg-pink-50',
        iconColor: 'text-pink-600'
      },
    ];

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Why Choose YojnaSathi?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive features designed to make scheme discovery and eligibility checking simple and effective.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative bg-white rounded-2xl p-8 border border-slate-100 hover:border-transparent transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.bg}`}>
                    <Icon size={28} className={feature.iconColor} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  // ===== HOW IT WORKS SECTION =====
  const HowItWorksSection = () => {
    const steps = [
      {
        icon: CheckSquare,
        title: 'Enter Details',
        description: 'Provide basic demographic information securely.',
        step: 1,
      },
      {
        icon: Lightbulb,
        title: 'ML Matching',
        description: 'Our engine finds the perfect schemes for your profile.',
        step: 2,
      },
      {
        icon: User,
        title: 'Apply & Track',
        description: 'Get actionable links and clear application steps.',
        step: 3,
      },
    ];

    return (
      <section className="py-24 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to unlock your government benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 -translate-y-1/2 z-0" />
            
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 mb-6 relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <Icon size={32} className="text-blue-600" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // ===== CTA SECTION =====
  const CTASection = () => (
    <section className="py-24 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden bg-slate-900 shadow-2xl">
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -right-[20%] w-[100%] h-[150%] bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform rotate-12" />
          </div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Ready to claim your benefits?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join thousands of citizens discovering their scheme entitlements through our secure platform today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/register')}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto font-semibold text-slate-900 bg-white rounded-full transition-all hover:scale-105"
              >
                <span>Create Free Account</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <p className="text-slate-400 text-sm">
              Takes less than 2 minutes • 100% Free
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
