import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, 
  ArrowLeft,
  User,
  CheckCircle,
  Loader2,
  Sparkles,
  FileCheck,
  Home,
  AlertCircle
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { recommendationService, type RecommendationResult } from "@/services";

const steps = [
  { id: 1, title: "Your Information", icon: User },
  { id: 2, title: "Results", icon: CheckCircle },
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

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Validate required fields
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

      // Validate age is reasonable
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

      // Validate income is positive
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

      // Prepare data for ML API (matches UserProfileForML schema)
      const mlPredictionData = {
        age: age,
        income: income,
        gender: formData.gender.toLowerCase(),
        category: formData.category.toLowerCase(),
      };

      console.log("📤 Sending ML prediction request:", mlPredictionData);
      console.log("🔗 API Endpoint: POST /ml/predict-schemes");

      // Call real ML prediction API
      const response = await recommendationService.predictSchemes(mlPredictionData);
      
      console.log("📥 ML API Response:", response.data);
      console.log(`✅ Found ${response.data.recommended_schemes?.length || 0} eligible schemes`);

      if (response.data && response.data.recommended_schemes) {
        // Store real API results in state
        setEligibleSchemes(response.data.recommended_schemes);
        
        toast({
          title: "✅ Eligibility Check Complete!",
          description: `We found ${response.data.total_eligible || response.data.recommended_schemes.length} schemes you're eligible for.`,
        });
      }
      
      setCurrentStep(2);
    } catch (error: any) {
      console.error("❌ ML API Error:", error);
      
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message ||
                           error.message ||
                           "Could not connect to ML service. Please try again.";
      
      console.error("Error details:", errorMessage);
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
            className="space-y-6"
          >
            {/* Age Input */}
            <div className="space-y-2">
              <Label htmlFor="age">Age (years) *</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="h-12"
                min="1"
                max="120"
              />
            </div>

            {/* Annual Income */}
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income (₹) *</Label>
              <Input
                id="income"
                type="number"
                placeholder="Enter your annual income in rupees"
                value={formData.income}
                onChange={(e) => handleInputChange("income", e.target.value)}
                className="h-12"
                min="0"
              />
              <p className="text-xs text-muted-foreground">Example: 250000 for ₹2.5 Lakh</p>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label>Gender *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
                className="flex gap-6"
              >
                {["male", "female", "other"].map((gender) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <RadioGroupItem value={gender} id={gender} />
                    <Label htmlFor={gender} className="font-normal capitalize">
                      {gender}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Social Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Social Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your social category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC (Other Backward Class)</SelectItem>
                  <SelectItem value="sc">SC (Scheduled Caste)</SelectItem>
                  <SelectItem value="st">ST (Scheduled Tribe)</SelectItem>
                  <SelectItem value="ews">EWS (Economically Weaker Section)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">ℹ️ How we use this info:</strong> Your age, income, gender, and social category help us match you with relevant government schemes using AI-powered recommendations.
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
            className="space-y-6"
          >
            {/* Error Alert */}
            {apiError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Unable to fetch recommendations</p>
                  <p className="text-sm text-red-800 mt-1">{apiError}</p>
                </div>
              </div>
            )}

            {/* Success header */}
            {!apiError && (
              <>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="font-bold text-2xl text-foreground mb-2">
                    Eligible Schemes Found! 🎉
                  </h2>
                  <p className="text-muted-foreground">
                    Based on your profile, here are government schemes you can apply for:
                  </p>
                </div>

                {/* Schemes list */}
                {eligibleSchemes && eligibleSchemes.length > 0 ? (
                  <div className="space-y-4">
                    {eligibleSchemes.slice(0, 5).map((scheme, index) => (
                      <motion.div
                        key={`${scheme.scheme_id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{scheme.scheme_name}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Eligible
                              </span>
                              <span className="text-sm font-semibold text-purple-600">
                                {Math.round((scheme.probability || 0) * 100)}% Match Score
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No schemes found matching your profile.</p>
                    <p className="text-sm text-muted-foreground mt-2">Try checking again with different information.</p>
                  </div>
                )}
              </>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button 
                onClick={() => {
                  setCurrentStep(1);
                  setApiError(null);
                }}
                className="flex-1"
              >
                <AnimatedButton variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Check Again
                </AnimatedButton>
              </button>
              <Link to="/dashboard" className="flex-1">
                <AnimatedButton className="w-full" glowEffect>
                  Go to Dashboard
                  <Sparkles className="ml-2 w-4 h-4" />
                </AnimatedButton>
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold gradient-text">YojnaSathi</span>
            </Link>
            <Link to="/dashboard">
              <AnimatedButton variant="ghost" size="sm">
                Skip to Dashboard
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: currentStep === step.id ? 1.1 : 1,
                    }}
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all",
                      currentStep >= step.id
                        ? "gradient-primary text-white shadow-glow"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "hidden md:block w-16 lg:w-24 h-1 mx-2 rounded-full transition-colors",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
            <div className="hidden md:flex justify-between mt-3">
              {steps.map((step) => (
                <span
                  key={step.id}
                  className={cn(
                    "text-xs font-medium transition-colors w-12 text-center",
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            layout
            className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg"
          >
            {currentStep < 2 && (
              <div className="mb-6">
                <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-2">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep < 2 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <AnimatedButton
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </AnimatedButton>

                <AnimatedButton
                  onClick={handleSubmit}
                  disabled={isLoading}
                  glowEffect
                  className="min-w-[180px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking Eligibility...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Check Eligibility
                    </>
                  )}
                </AnimatedButton>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
