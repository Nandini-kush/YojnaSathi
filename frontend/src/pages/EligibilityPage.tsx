/**
 * USAGE EXAMPLES
 * 
 * Different ways to use the EligibilityCheckComponent
 */

// ============================================================================
// EXAMPLE 1: Simple page using the component (RECOMMENDED)
// ============================================================================

import EligibilityCheckComponent from '../components/EligibilityCheckComponent';

export const EligibilityPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Scheme Eligibility Checker</h1>
          <p className="text-gray-600 mt-2">
            Find all government schemes you are eligible for based on your profile
          </p>
        </div>

        {/* Use the component */}
        <EligibilityCheckComponent />
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Embed in dashboard with other components
// ============================================================================

export const DashboardWithEligibility = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        {/* Other dashboard widgets */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3>Profile</h3>
          {/* Profile info */}
        </div>
      </div>

      {/* Main content with eligibility checker */}
      <div className="lg:col-span-3">
        <EligibilityCheckComponent />
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Modal/Dialog version
// ============================================================================

import { useState } from 'react';

export const EligibilityModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Check Eligibility
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Eligibility Checker</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <EligibilityCheckComponent />
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// EXAMPLE 4: In App.tsx routing
// ============================================================================

// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { EligibilityPage } from './pages/EligibilityPage';
// import { ProtectedRoute } from './components/ProtectedRoute';
// 
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         
//         // Protected route
//         <Route
//           path="/eligibility"
//           element={
//             <ProtectedRoute>
//               <EligibilityPage />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// ============================================================================
// EXAMPLE 5: Use in a multi-step form
// ============================================================================



interface Step {
  number: number;
  title: string;
  component: React.ReactNode;
}

export const MultiStepEligibility = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps: Step[] = [
    {
      number: 1,
      title: 'Personal Info',
      component: <div>Profile form here</div>,
    },
    {
      number: 2,
      title: 'Check Eligibility',
      component: <EligibilityCheckComponent />,
    },
    {
      number: 3,
      title: 'Apply',
      component: <div>Application form here</div>,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-12">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                currentStep >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.number}
            </div>
            <p className="ml-2 font-semibold text-gray-700">{step.title}</p>

            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current step component */}
      <div>{steps[currentStep - 1].component}</div>

      {/* Navigation buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={currentStep === steps.length}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EligibilityPage;
