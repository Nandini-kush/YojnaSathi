import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Star, 
  ArrowRight,
  CheckCircle,
  Clock,
  IndianRupee,
  Filter,
  Heart,
  Home,
  GraduationCap,
  Briefcase,
  Leaf
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { cn } from "@/lib/utils";

const recommendations = [
  {
    name: "PM Kisan Samman Nidhi",
    category: "Agriculture",
    benefit: "₹6,000/year",
    confidence: 98,
    badge: "Highly Recommended",
    description: "Direct income support for farmer families with cultivable land",
    deadline: "Open year-round",
    icon: Leaf,
    color: "from-success to-primary",
  },
  {
    name: "Ayushman Bharat PMJAY",
    category: "Health",
    benefit: "₹5L coverage",
    confidence: 95,
    badge: "Top Match",
    description: "Comprehensive health insurance covering 1,500+ medical procedures",
    deadline: "Open year-round",
    icon: Heart,
    color: "from-destructive to-secondary",
  },
  {
    name: "PM Awas Yojana (Urban)",
    category: "Housing",
    benefit: "₹2.5L subsidy",
    confidence: 89,
    badge: "New Opportunity",
    description: "Interest subsidy on home loans for first-time home buyers",
    deadline: "Dec 31, 2024",
    icon: Home,
    color: "from-secondary to-warning",
  },
  {
    name: "National Scholarship Portal",
    category: "Education",
    benefit: "Up to ₹50,000",
    confidence: 92,
    badge: "Apply Soon",
    description: "Merit and means-based scholarships for students at all levels",
    deadline: "Oct 31, 2024",
    icon: GraduationCap,
    color: "from-accent to-primary",
  },
  {
    name: "PM Mudra Yojana",
    category: "Business",
    benefit: "Up to ₹10L loan",
    confidence: 85,
    badge: "Good Match",
    description: "Collateral-free loans for small business entrepreneurs",
    deadline: "Open year-round",
    icon: Briefcase,
    color: "from-primary to-accent",
  },
];

const categories = ["All", "Agriculture", "Health", "Housing", "Education", "Business"];

export default function Recommendations() {
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
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            AI-Powered Recommendations
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Personalized Scheme
            <span className="gradient-text"> Recommendations</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI has analyzed your profile and found schemes with the highest match scores. 
            These recommendations are ranked by eligibility confidence.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Schemes Analyzed", value: "500+", icon: Brain },
            { label: "Your Matches", value: "5", icon: CheckCircle },
            { label: "Avg. Confidence", value: "92%", icon: TrendingUp },
            { label: "Potential Benefits", value: "₹8L+", icon: IndianRupee },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-card rounded-xl p-4 border border-border text-center"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-display font-bold text-xl text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-8 overflow-x-auto pb-2"
        >
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                category === "All"
                  ? "gradient-primary text-white"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Recommendations Grid */}
        <div className="space-y-6">
          {recommendations.map((scheme, index) => (
            <motion.div
              key={scheme.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Icon & Badge */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      scheme.color
                    )}>
                      <scheme.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="md:hidden">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        {scheme.badge}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                          {scheme.name}
                        </h3>
                        <p className="text-muted-foreground mt-1">{scheme.description}</p>
                      </div>
                      <div className="hidden md:block">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                          <Sparkles className="w-3 h-3" />
                          {scheme.badge}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                        {scheme.category}
                      </span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-success" />
                        {scheme.benefit}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {scheme.deadline}
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scheme.confidence}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                          className="h-full gradient-primary rounded-full"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <Star className="w-4 h-4 fill-current" />
                        {scheme.confidence}% Match
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex md:flex-col gap-3 md:w-32">
                    <AnimatedButton size="sm" className="flex-1 md:w-full">
                      Apply
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </AnimatedButton>
                    <AnimatedButton variant="outline" size="sm" className="flex-1 md:w-full">
                      Details
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load more */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <AnimatedButton variant="outline">
            Load More Recommendations
          </AnimatedButton>
        </motion.div>
      </main>
    </div>
  );
}
