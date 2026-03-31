import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export default function Tickets() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", issue: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Read User context on mount to auto-fill
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setForm(f => ({ ...f, name: user.name || "", email: user.email || "" }));
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.issue.trim()) e.issue = "Please describe your issue";
    else if (form.issue.trim().length < 10) e.issue = "Please provide more detail (min 10 chars)";
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(ev => ({ ...ev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/tickets", { ...form, status: "Open" });
      toast("Ticket submitted successfully!", "success");
      setSubmitted(true);
      setForm({ name: "", email: "", issue: "" });
    } catch (err) {
      toast(err.response?.data?.message || "Failed to create ticket", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Submit a Ticket</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Describe your issue and we'll get back to you as soon as possible.</p>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900 rounded-xl px-4 py-3"
            >
              <span className="text-green-500 text-lg">✅</span>
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Ticket submitted!</p>
                <p className="text-xs text-green-600/80 dark:text-green-500">We'll respond to your email shortly.</p>
              </div>
              <button onClick={() => setSubmitted(false)} className="ml-auto text-green-500 hover:text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </motion.div>
          )}

          <div className="card dark:bg-slate-800 dark:border-slate-700 p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Your name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  className={`input dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.name ? "border-red-400" : ""}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`input dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.email ? "border-red-400" : ""}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Describe your issue
                </label>
                <textarea
                  name="issue"
                  rows={5}
                  placeholder="Please describe your issue in detail…"
                  value={form.issue}
                  onChange={handleChange}
                  className={`input resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.issue ? "border-red-400" : ""}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.issue
                    ? <p className="text-xs text-red-500">{errors.issue}</p>
                    : <span />
                  }
                  <span className={`text-xs ${form.issue.length > 10 ? "text-slate-400" : "text-slate-300"}`}>
                    {form.issue.length} chars
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
