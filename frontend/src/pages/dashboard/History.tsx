import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, 
  History as HistoryIcon, 
  Calendar, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ChevronRight,
  Loader2
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { eligibilityAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const defaultHistoryData = [
  {
    id: 1,
    date: "Jan 15, 2024",
    time: "10:30 AM",
    totalSchemes: 5,
    eligible: 5,
    notEligible: 0,
    status: "completed",
    schemes: ["PM Kisan", "Ayushman Bharat", "PM Awas Yojana"],
  },
  {
    id: 2,
    date: "Jan 10, 2024",
    time: "3:45 PM",
    totalSchemes: 8,
    eligible: 6,
    notEligible: 2,
    status: "completed",
    schemes: ["National Scholarship", "PM Mudra Yojana", "Sukanya Samriddhi"],
  },
];

const statusColors = {
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
};

export default function History() {
  const [historyData, setHistoryData] = useState(defaultHistoryData);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await eligibilityAPI.getHistory();
        
        if (response.data && Array.isArray(response.data)) {
          // Transform API response to match UI format
          const transformedData = response.data.map((item: any) => ({
            id: item.id || Math.random(),
            date: item.date || new Date().toLocaleDateString(),
            time: item.time || new Date().toLocaleTimeString(),
            totalSchemes: item.total_schemes || item.eligible_schemes?.length || 0,
            eligible: item.eligible || item.eligible_schemes?.length || 0,
            notEligible: item.not_eligible || 0,
            status: item.status || "completed",
            schemes: item.eligible_schemes || item.schemes || [],
          }));
          setHistoryData(transformedData);
        }
      } catch (error: any) {
        console.warn("Could not fetch history:", error);
        toast({
          title: "Info",
          description: "Showing sample data. Could not fetch your history from server.",
        });
        // Use default data
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [toast]);

  const filteredData = historyData;
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
              <AnimatedButton variant="outline" size="sm">
                Back to Dashboard
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground flex items-center gap-3">
                <HistoryIcon className="w-8 h-8 text-primary" />
                Eligibility History
              </h1>
              <p className="text-muted-foreground mt-1">
                Track all your past eligibility checks and scheme matches
              </p>
            </div>
            <AnimatedButton variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export History
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by scheme name..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <AnimatedButton variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </AnimatedButton>
              <AnimatedButton variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </AnimatedButton>
            </div>
          </div>
        </motion.div>

        {/* History Timeline */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Date indicator */}
                    <div className="flex items-center gap-4 md:w-40">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{entry.date}</div>
                        <div className="text-sm text-muted-foreground">{entry.time}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div className="text-center md:text-left">
                        <div className="text-2xl font-display font-bold text-foreground">
                          {entry.totalSchemes}
                        </div>
                        <div className="text-xs text-muted-foreground">Schemes Checked</div>
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-2xl font-display font-bold text-success flex items-center justify-center md:justify-start gap-1">
                          <CheckCircle className="w-5 h-5" />
                          {entry.eligible}
                        </div>
                        <div className="text-xs text-muted-foreground">Eligible</div>
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-2xl font-display font-bold text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                          <XCircle className="w-5 h-5" />
                          {entry.notEligible}
                        </div>
                        <div className="text-xs text-muted-foreground">Not Eligible</div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        statusColors[entry.status as keyof typeof statusColors]
                      )}>
                        <CheckCircle className="w-3 h-3" />
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                      <AnimatedButton variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </AnimatedButton>
                    </div>
                  </div>

                  {/* Schemes preview */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {entry.schemes.slice(0, 3).map((scheme) => (
                        <span
                          key={scheme}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                        >
                          {scheme}
                        </span>
                      ))}
                      {entry.schemes.length > 3 && (
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{entry.schemes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              <p>No eligibility checks found. Start your first check!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          <AnimatedButton variant="outline" size="sm" disabled>
            Previous
          </AnimatedButton>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page 1 of 3
          </span>
          <AnimatedButton variant="outline" size="sm">
            Next
          </AnimatedButton>
        </motion.div>
      </main>
    </div>
  );
}
