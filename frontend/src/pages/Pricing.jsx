import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Perfect for trying things out",
    features: ["10 Tickets / Month", "Basic Dashboard", "Email Support", "1 Agent"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/mo",
    desc: "For growing support teams",
    features: ["Unlimited Tickets", "Advanced Analytics", "Priority Support", "5 Agents", "Custom Statuses"],
    cta: "Upgrade to Pro",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large-scale operations",
    features: ["Unlimited Everything", "Dedicated Manager", "Custom Integrations", "SLA Support", "SSO + Security"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Simple, transparent pricing</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Start free, scale as you grow. No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative rounded-2xl border p-8 flex flex-col
                ${plan.highlight
                  ? "bg-primary border-primary/30 text-white shadow-xl shadow-primary/20 scale-[1.02]"
                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-primary text-xs font-bold rounded-full shadow border border-primary/20">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${plan.highlight ? "text-white/70" : "text-slate-400"}`}>{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>{plan.price}</span>
                  {plan.period && <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-slate-400"}`}>{plan.period}</span>}
                </div>
                <p className={`text-sm mt-1 ${plan.highlight ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-white/90" : "text-slate-600 dark:text-slate-300"}`}>
                    <svg className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-white" : "text-green-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(plan.name === "Enterprise" ? "/docs" : "/register")}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95
                  ${plan.highlight
                    ? "bg-white text-primary hover:bg-white/90"
                    : "btn-primary"
                  }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
