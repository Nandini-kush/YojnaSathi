import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { 
  ArrowLeft,
  User,
  CheckCircle,
  Loader2,
  Sparkles,
  Home,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/errorHandler";
import { recommendationService, type RecommendationResult } from "@/services";

const steps = [
  { id: 1, title: "Your Profile", icon: User },
  { id: 2, title: "Matches", icon: CheckCircle },
];

export default function EligibilityCheck() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [eligibleSchemes, setEligibleSchemes] = useState<RecommendationResult[]>([]);
  const [formData, setFormData] = useState({
    age: "",
    income: "",
    gender: "",
    category: "",
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      if (!formData.age || !formData.gender || !formData.income || !formData.category) {
        const errorMsg = "Please fill in all required fields (Age, Income, Gender, Category)";
        setApiError(errorMsg);
        toast({
          title: "Validation Error",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const age = parseInt(formData.age);
      if (isNaN(age) || age <= 0 || age > 120) {
        const errorMsg = "Please enter a valid age between 1 and 120";
        setApiError(errorMsg);
        toast({
          title: "Invalid Age",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const income = parseFloat(formData.income);
      if (isNaN(income) || income < 0) {
        const errorMsg = "Please enter a valid income amount";
        setApiError(errorMsg);
        toast({
          title: "Invalid Income",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const mlPredictionData = {
        age: age,
        income: income,
        gender: formData.gender.toLowerCase(),
        category: formData.category.toLowerCase(),
      };

      const response = await recommendationService.predictSchemes(mlPredictionData);

      if (response.data && response.data.recommended_schemes) {
        setEligibleSchemes(response.data.recommended_schemes);
        toast({
          title: "✅ Eligibility Check Complete!",
          description: `We found ${response.data.total_eligible || response.data.recommended_schemes.length} schemes you're eligible for.`,
        });
      }
      
      setCurrentStep(2);
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      setApiError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Age Input */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-slate-700 font-semibold">Age (years) <span className="text-red-500">*</span></Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 25"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-xl"
                  min="1"
                  max="120"
                />
              </div>

              {/* Annual Income */}
              <div className="space-y-2">
                <Label htmlFor="income" className="text-slate-700 font-semibold">Annual Income (₹) <span className="text-red-500">*</span></Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="e.g. 250000"
                  value={formData.income}
                  onChange={(e) => handleInputChange("income", e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-xl"
                  min="0"
                />
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label className="text-slate-700 font-semibold">Gender <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex gap-4"
                >
                  {["male", "female", "other"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2 bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl flex-1 cursor-pointer transition-colors hover:bg-blue-50 hover:border-blue-200">
                      <RadioGroupItem value={gender} id={gender} />
                      <Label htmlFor={gender} className="font-medium capitalize cursor-pointer flex-1">
                        {gender}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Social Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 font-semibold">Social Category <span className="text-red-500">*</span></Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl">
                    <SelectValue placeholder="Select your social category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="obc">OBC (Other Backward Class)</SelectItem>
                    <SelectItem value="sc">SC (Scheduled Caste)</SelectItem>
                    <SelectItem value="st">ST (Scheduled Tribe)</SelectItem>
                    <SelectItem value="ews">EWS (Economically Weaker)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-semibold">AI-Powered Matching:</span> Your details are securely analyzed against our entire database to instantly recommend the exact government schemes you qualify for.
              </p>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {apiError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Unable to fetch recommendations</p>
                  <p className="text-sm text-red-800 mt-1">{apiError}</p>
                </div>
              </div>
            )}

            {!apiError && (
              <>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="font-bold text-3xl text-slate-900 mb-2 tracking-tight">
                    Matches Found!
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Based on your profile, here are schemes you can apply for:
                  </p>
                </div>

                {eligibleSchemes && eligibleSchemes.length > 0 ? (
                  <div className="space-y-4">
                    {eligibleSchemes.slice(0, 5).map((scheme, index) => (
                      <motion.div
                        key={`${scheme.scheme_id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                            <Home className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{scheme.scheme_name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 text-green-700 text-xs font-bold border border-green-200/50">
                                <CheckCircle className="w-3 h-3" />
                                Eligible
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/50">
                                Match: {Math.round((scheme.probability || 0) * 100)}%
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    <p className="text-slate-600 font-medium text-lg">No exact matches found.</p>
                    <p className="text-sm text-slate-500 mt-2">Try updating your profile details.</p>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200">
              <button 
                onClick={() => {
                  setCurrentStep(1);
                  setApiError(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Refine Details
              </button>
              <Link to="/dashboard" className="flex-1">
                <button className="w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-md flex items-center justify-center gap-2">
                  Go to Dashboard
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard">
              <Logo size="md" />
            </Link>
            <Link to="/dashboard">
              <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Discover Your Schemes</h1>
          <p className="text-slate-500 font-medium">Follow the steps to securely check your eligibility.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 relative flex items-center justify-center max-w-sm mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: currentStep === 1 ? '0%' : '100%' }}
          />
          
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className={`relative z-10 flex flex-col items-center ${step.id === 1 ? 'mr-auto' : 'ml-auto'}`}>
                <motion.div
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border-4 border-slate-50",
                    isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : 
                    isCompleted ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
                  )}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </motion.div>
                <span className={cn("absolute -bottom-6 text-xs font-bold uppercase tracking-wider whitespace-nowrap", isActive || isCompleted ? "text-blue-900" : "text-slate-400")}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <motion.div
          layout
          className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation */}
          {currentStep < 2 && (
            <div className="mt-10 pt-8 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 group shadow-md hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    Run Eligibility Check
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
