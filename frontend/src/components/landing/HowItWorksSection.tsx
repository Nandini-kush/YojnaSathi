import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, Lightbulb, CheckSquare } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
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

export default HowItWorksSection;
