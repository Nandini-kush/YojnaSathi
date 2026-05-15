import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, ExternalLink, FileText, CheckCircle, Info, Landmark } from "lucide-react";
import { schemesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SchemeDetailResponse, SchemeData } from "@/types/api";
import Logo from "@/components/common/Logo";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") return value.trim() === "" ? "—" : value;
  return String(value);
}

function shouldDisplay(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function categorizeFields(scheme: SchemeData): Record<string, [string, any][]> {
  const categories: Record<string, [string, any][]> = {
    "Basic Information": [],
    "Eligibility Criteria": [],
    "Benefits & Details": [],
    "Additional Information": [],
  };

  const fieldMap: Record<string, string> = {
    id: "Basic Information",
    scheme_name: "Basic Information",
    is_active: "Basic Information",
    gender: "Eligibility Criteria",
    caste: "Eligibility Criteria",
    state: "Eligibility Criteria",
    min_age: "Eligibility Criteria",
    max_age: "Eligibility Criteria",
    max_income: "Eligibility Criteria",
    benefits: "Benefits & Details",
    description: "Benefits & Details",
    ministry: "Additional Information",
    official_link: "Additional Information",
  };

  Object.entries(scheme).forEach(([key, value]) => {
    if (!shouldDisplay(value)) return;
    const category = fieldMap[key] || "Additional Information";
    categories[category].push([key, value]);
  });

  return Object.fromEntries(
    Object.entries(categories).filter(([, fields]) => fields.length > 0)
  );
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Basic Information": return <Info className="w-5 h-5 text-blue-500" />;
    case "Eligibility Criteria": return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "Benefits & Details": return <FileText className="w-5 h-5 text-purple-500" />;
    case "Additional Information": return <Landmark className="w-5 h-5 text-indigo-500" />;
    default: return <Info className="w-5 h-5 text-slate-500" />;
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function SchemeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [scheme, setScheme] = useState<SchemeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheme = async () => {
      if (!id || isNaN(Number(id))) {
        setError("Invalid scheme ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await schemesAPI.getSchemeDetail(Number(id));

        if (!response.data) {
          setError("Server returned empty response");
          return;
        }

        const data: SchemeDetailResponse = response.data;

        if (!data.success) {
          setError(data.error || "Failed to load scheme");
          return;
        }

        if (!data.scheme) {
          setError("Scheme data missing in response");
          return;
        }

        setScheme(data.scheme);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load scheme details";

        setError(errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheme();
  }, [id, toast]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">Retrieving scheme details...</p>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-lg w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Error Loading Scheme
          </h2>
          <p className="text-slate-500 mb-8">
            {error || "Scheme not found"}
          </p>
          <button
            onClick={handleGoBack}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-all w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const categorized = categorizeFields(scheme);
  const schemeName = scheme.scheme_name || `Scheme #${scheme.id}`;
  const officialLink = scheme.official_link as string | undefined;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Back to Results
          </button>
          <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Logo size="md" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Scheme Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12"
        >
          {/* Background Gradients */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-gradient-to-l from-blue-500/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[150%] bg-gradient-to-r from-purple-500/20 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6">
              <Landmark size={16} />
              Government Scheme
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {schemeName}
            </h1>
            
            <p className="text-slate-300 text-lg max-w-3xl mb-8 leading-relaxed">
              {scheme.description || "Review the complete details, eligibility requirements, and benefits associated with this scheme."}
            </p>

            {officialLink && typeof officialLink === "string" && officialLink.startsWith("http") && (
              <a
                href={officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]"
              >
                Apply on Official Portal
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </motion.div>

        {/* Scheme Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(categorized).map(([category, fields], index) => {
            // Put Benefits full width if it's the last one and uneven
            const isFullWidth = category === "Benefits & Details" || category === "Additional Information";
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={category}
                className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${isFullWidth ? 'md:col-span-2' : ''}`}
              >
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{category}</h3>
                </div>
                
                <div className={`p-6 ${isFullWidth ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-5'}`}>
                  {fields.map(([key, value]) => {
                    // Skip description in Benefits if we already showed it in hero
                    if (key === "description" && category === "Benefits & Details") return null;
                    // Skip official link as it's a button in hero
                    if (key === "official_link") return null;

                    return (
                      <div key={key} className={`${isFullWidth ? 'bg-slate-50 p-4 rounded-xl border border-slate-100' : 'pb-4 border-b border-slate-100 last:border-0 last:pb-0'}`}>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          {formatKey(key)}
                        </p>
                        <p className="text-slate-900 font-medium whitespace-pre-wrap">
                          {formatValue(value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleGoBack}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl font-semibold shadow-sm transition-all"
          >
            Back to Recommendations
          </button>
        </div>
      </main>
    </div>
  );
}
