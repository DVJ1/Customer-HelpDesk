import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const features = [
  {
    icon: "🎯",
    title: "Smart Ticketing",
    desc: "Automatically categorize and assign tickets with intelligent workflows.",
    color: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-100 dark:border-blue-900/50",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    desc: "Internal notes, mentions, and shared views for faster resolution.",
    color: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-100 dark:border-violet-900/50",
  },
  {
    icon: "📊",
    title: "Analytics & Insights",
    desc: "Track performance, response times, and customer satisfaction easily.",
    color: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-100 dark:border-emerald-900/50",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-violet-400/6 dark:bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-3xl"
        >
          {user ? (
            // User is logged in
            <>
              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white"
              >
                Welcome back,<br />
                <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  {user.name.split(' ')[0]}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                {user.role === "admin" 
                  ? "Access the Staff Portal to manage and resolve customer issues." 
                  : "We are here to help. Raise a new support request or track the progress of your existing tickets seamlessly."}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                {user.role === "admin" ? (
                   <button
                     onClick={() => navigate("/admin/dashboard")}
                     className="btn-primary px-8 py-4 text-base w-full sm:w-auto text-center justify-center font-bold shadow-lg shadow-primary/20"
                   >
                     Enter Admin Dashboard →
                   </button>
                ) : (
                   <>
                     <button
                       onClick={() => navigate("/tickets")}
                       className="btn-primary px-8 py-4 text-base w-full sm:w-auto text-center justify-center font-bold shadow-lg shadow-primary/20"
                     >
                       + Raise a Ticket
                     </button>
                     <button
                       onClick={() => navigate("/track-tickets")}
                       className="btn-secondary px-8 py-4 text-base w-full sm:w-auto text-center justify-center font-bold"
                     >
                       Track Problem Progress
                     </button>
                   </>
                )}
              </motion.div>
            </>
          ) : (
            // NOT Logged In (Marketing Hero)
            <>
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Your Support Hub
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white"
              >
                Support that<br />
                <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  moves fast.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                Manage tickets, streamline support, and deliver better service with
                a powerful, modern helpdesk platform built for growing teams.
              </motion.p>

              {/* Explicit buttons as demanded */}
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="btn-primary px-6 py-3 text-base"
                >
                  Login as User
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn-secondary px-6 py-3 text-base bg-white dark:bg-slate-800"
                >
                  Sign up as User
                </button>
                <div className="w-full h-2"></div>
                <button
                  onClick={() => navigate("/admin-login")}
                  className="px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors border border-dashed border-slate-300 dark:border-slate-700 rounded-xl w-full sm:w-auto"
                >
                   Login as Admin (Staff)
                </button>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Hero card (hidden if user is logged in to keep it clean) */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl p-6 max-w-lg hidden sm:block"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Ticket #1024</p>
                <p className="text-slate-800 dark:text-slate-100 font-semibold mt-0.5">Login issue on dashboard</p>
              </div>
              <span className="badge-open">Open</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              User is unable to log in after password reset. Reported on Chrome and Safari.
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">A</div>
              <span className="text-xs text-slate-400">Assigned to Admin · 2 min ago</span>
              <span className="ml-auto text-xs text-primary font-medium cursor-pointer hover:underline">Resolve →</span>
            </div>
          </motion.div>
        )}
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Platform Features</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything you need to deliver<br />exceptional support</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`p-6 rounded-2xl border ${f.color} ${f.border} cursor-default`}
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
         <section className="max-w-7xl mx-auto px-6 pb-24">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-12 text-center text-white"
           >
             <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
             <p className="text-white/70 mb-7 max-w-md mx-auto">Join teams already using HelpDesk to deliver faster, smarter support.</p>
             <button onClick={() => navigate("/register")} className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all active:scale-95">
               Create free account →
             </button>
           </motion.div>
         </section>
      )}
    </div>
  );
}
