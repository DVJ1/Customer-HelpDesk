import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
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
      const res = await axios.post("https://customer-helpdesk.onrender.com/api/admin/login", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast("Agent Authentication Successful 🔐", "success");
      navigate("/admin/dashboard");
    } catch (err) {
      toast(err.response?.data?.message || "Login failed", "error");
      setErrors({ password: err.response?.data?.message || "Access denied" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background flair for Admin portal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full point-events-none opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Staff Portal</h1>
          <p className="mt-1 text-sm text-slate-400">Restricted access for authorized agents</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Agent Email</label>
              <input
                name="email"
                type="email"
                placeholder="agent@company.com"
                value={form.email}
                onChange={handleChange}
                className={`input bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-primary/50 focus:ring-primary/20 ${errors.email ? "border-red-500/50" : ""}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`input bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-primary/50 focus:ring-primary/20 ${errors.password ? "border-red-500/50" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm mt-4 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Authorize"}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-6 font-mono">
          System Access is permanently monitored.
        </p>
      </motion.div>
    </div>
  );
}
