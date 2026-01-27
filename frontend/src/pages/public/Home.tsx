import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, CheckSquare, Lightbulb, User, Search, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import logo from '@/assets/yojnasathi_logo.png';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // ===== HERO SECTION =====
  const HeroSection = () => (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-700 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full text-center text-white space-y-8"
        >
          {/* Logo Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <img
              src={logo}
              alt="YojnaSathi Logo"
              className="h-24 md:h-32 lg:h-40 w-auto object-contain"
            />
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Your Gateway to Government Schemes
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Discover, check eligibility, and get personalized recommendations for government schemes you're entitled to.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-white/30 transition duration-300 transform hover:scale-105 cursor-pointer"
            >
              <span>Get Started</span>
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition duration-300 cursor-pointer"
            >
              <span>Login to Dashboard</span>
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-12"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <ChevronRight size={24} className="text-white/60 transform -rotate-90" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  // ===== FEATURES SECTION (Why Choose) =====
  const FeaturesSection = () => {
    const features = [
      {
        icon: Search,
        title: 'Smart Search',
        description: 'Quickly find schemes by category, eligibility criteria, or keyword. Our intelligent search makes finding the right scheme easy.',
        color: 'blue',
      },
      {
        icon: CheckCircle,
        title: 'Instant Eligibility Check',
        description: 'Get instant results on scheme eligibility based on your age, income, education, and other criteria. No complex forms required.',
        color: 'green',
      },
      {
        icon: Zap,
        title: 'Real-Time Updates',
        description: 'Stay updated with the latest scheme changes, new launches, and eligibility updates. Never miss out on an opportunity.',
        color: 'yellow',
      },
      {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Your data is encrypted and protected. We never share your personal information with third parties.',
        color: 'purple',
      },
    ];

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8 },
      },
    };

    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
    };

    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose YojnaSathi?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed to make scheme discovery and eligibility checking simple and effective.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition duration-300"
                >
                  <div className={`w-16 h-16 ${colorMap[feature.color]} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
        title: 'Eligibility Check',
        description: 'Enter your basic details and instantly check your eligibility for various government schemes.',
        step: 1,
      },
      {
        icon: Lightbulb,
        title: 'ML Recommendations',
        description: 'Get personalized scheme recommendations powered by machine learning algorithms.',
        step: 2,
      },
      {
        icon: User,
        title: 'Easy to Use',
        description: 'Simple and intuitive interface designed for citizens of all backgrounds.',
        step: 3,
      },
    ];

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8 },
      },
    };

    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How YojnaSathi Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple three-step process to find the government schemes you're eligible for
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={index} className="relative">
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Step Number */}
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                        <Icon size={40} className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {item.step}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </motion.div>

                  {/* Arrow */}
                  {!isLast && (
                    <div className="hidden md:block absolute top-1/2 -right-12 transform -translate-y-1/2">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowRight size={32} className="text-blue-600" />
                      </motion.div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-2xl p-8 md:p-12 max-w-3xl mx-auto shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">2 mins</div>
                <p className="text-gray-600">Average time to complete eligibility check</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                <p className="text-gray-600">Free and no hidden charges</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
                <p className="text-gray-600">Available anytime, anywhere</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // ===== TESTIMONIALS SECTION =====
  // ===== CTA SECTION =====
  const CTASection = () => (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-12 md:p-16 text-center text-white overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-20 -mb-20"></div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Find Your Eligible Schemes?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of citizens who have discovered their government scheme entitlements through YojnaSathi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-white/30 transition duration-300 transform hover:scale-105 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ChevronRight size={20} />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition duration-300 cursor-pointer"
              >
                Login Now
              </button>
            </div>

            {/* Additional Info */}
            <p className="text-white/80 text-sm pt-4">
              No credit card required • Instant access • 100% free
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-white">
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
