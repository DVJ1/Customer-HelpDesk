import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import TicketSheet from "../components/TicketSheet";

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50">
      <div className="flex-1 space-y-2 pr-8">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/3" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-14 rounded-lg" />
      </div>
    </div>
  );
}

function StatSkeleton() {
  return <div className="card dark:bg-slate-800 dark:border-slate-700 p-5 space-y-3"><div className="skeleton h-4 w-24" /><div className="skeleton h-8 w-12" /></div>;
}

function StatusBadge({ status }) {
  const map = {
    Open: "badge-open",
    "In Progress": "badge-in-progress",
    Resolved: "badge-resolved",
  };
  return <span className={map[status] || "badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}>{status}</span>;
}

function PriorityDot({ priority }) {
  if (!priority) return null;
  const map = {
    Low: "bg-blue-400",
    Medium: "bg-amber-400",
    High: "bg-red-500",
  };
  return <div className={`w-2 h-2 rounded-full ${map[priority]} shadow-sm`} title={`Priority: ${priority}`} />;
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────
function SidebarItem({ icon, label, to, active, onClick }) {
  const inner = (
    <span className={`sidebar-link w-full ${active ? "active" : ""}`} onClick={onClick}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </span>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

// ── Create Ticket Modal ───────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", issue: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.issue.trim()) e.issue = "Required";
    return e;
  };

  const handle = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(ev => ({ ...ev, [e.target.name]: "" }));
  };

  const submit = async () => {
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      await axios.post("https://customer-helpdesk.onrender.com/api/tickets", { ...form, status: "Open" });
      toast("Ticket created!", "success");
      onCreated();
      onClose();
    } catch {
      toast("Failed to create ticket", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-md mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">New Ticket</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-4">
          {[
            { name: "name", label: "Name", placeholder: "Customer name", type: "text" },
            { name: "email", label: "Email", placeholder: "customer@example.com", type: "email" },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handle}
                className={`input dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm ${errors[f.name] ? "border-red-400" : ""}`}
              />
              {errors[f.name] && <p className="mt-0.5 text-xs text-red-500">{errors[f.name]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Issue</label>
            <textarea
              name="issue"
              rows={3}
              placeholder="Describe the issue…"
              value={form.issue}
              onChange={handle}
              className={`input resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm ${errors.issue ? "border-red-400" : ""}`}
            />
            {errors.issue && <p className="mt-0.5 text-xs text-red-500">{errors.issue}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
            <button onClick={submit} disabled={loading} className="btn-primary flex-1 justify-center text-sm disabled:opacity-60">
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Create Ticket"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const toast = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      navigate("/admin-login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(u);
      if (parsedUser.role !== "admin") {
        navigate("/login");
        return;
      }
      setUser(parsedUser);
      axios.get("https://customer-helpdesk.onrender.com/api/users").then(res => setUsers(res.data)).catch(() => {});
    } catch {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Keyboard shortcut: N = new ticket, Escape = close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "n" && !e.target.closest("input, textarea")) setShowModal(true);
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get("https://customer-helpdesk.onrender.com/api/tickets");
      setTickets(res.data);
    } catch {
      toast("Could not load tickets", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`https://customer-helpdesk.onrender.com/api/tickets/${id}`);
      setTickets(t => t.filter(x => x._id !== id));
      toast("Ticket deleted", "info");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const updateStatus = async (id, status) => {
    // Optimistic UI
    const originalTickets = [...tickets];
    setTickets(t => t.map(x => x._id === id ? { ...x, status } : x));
    
    try {
      const res = await axios.put(`https://customer-helpdesk.onrender.com/api/tickets/${id}`, { 
        status,
        actionUser: user?.name || "System"
      });
      // Replace with full server payload which contains activities
      setTickets(t => t.map(x => x._id === id ? res.data : x));
      toast(`Ticket marked as ${status}`, "success");
    } catch {
      setTickets(originalTickets);
      toast("Failed to update", "error");
    }
  };

  const handleTicketUpdate = (updatedTicket) => {
    setTickets(t => t.map(x => x._id === updatedTicket._id ? updatedTicket : x));
    if (selectedTicket?._id === updatedTicket._id) {
       setSelectedTicket(updatedTicket);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === "All" || t.status === filter;
    const matchSearch = !search || t.issue.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = [
    { label: "Open", count: tickets.filter(t => t.status === "Open").length, color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20", icon: "🔴" },
    { label: "In Progress", count: tickets.filter(t => t.status === "In Progress").length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40", icon: "🟡" },
    { label: "Resolved", count: tickets.filter(t => t.status === "Resolved").length, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/40", icon: "🟢" },
    { label: "Total", count: tickets.length, color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-700/40", icon: "📋" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-[#0F172A] dark:bg-slate-950 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-white/8">
          <span className="text-lg font-bold text-white tracking-tight">
            Help<span className="text-primary">Desk</span><span className="text-primary">.</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <SidebarItem icon="⚡" label="Dashboard" to="/dashboard" active />
          <SidebarItem icon="🎫" label="Tickets" to="/tickets" />
          <SidebarItem icon="📖" label="Docs" to="/docs" />
          <SidebarItem icon="💰" label="Pricing" to="/pricing" />
        </nav>

        {/* User + logout */}
        <div className="px-3 pb-4 border-t border-white/8 pt-3">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.role === "admin" ? "Administrator" : "User"}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link w-full mt-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 gap-4 shrink-0">
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            onClick={() => setSidebarOpen(o => !o)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Dashboard</h1>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets…"
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-48 transition-all focus:w-64"
              />
            </div>

            {/* Dark mode */}
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {dark
                ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              }
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="btn-primary text-xs px-3 py-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
              <kbd className="hidden md:inline-flex ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">N</kbd>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loading
              ? [0,1,2,3].map(i => <StatSkeleton key={i} />)
              : stats.map(s => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card dark:bg-slate-800 dark:border-slate-700 p-5"
                >
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${s.bg} mb-3 text-sm`}>{s.icon}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.count}</p>
                </motion.div>
              ))
            }
          </div>

          {/* Ticket Table */}
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            {/* Table header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                All Tickets
                <span className="ml-2 text-xs font-normal text-slate-400">({filtered.length})</span>
              </h2>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
                {["All", "Open", "In Progress", "Resolved"].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                      filter === s
                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile search */}
            <div className="md:hidden px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets…"
                className="input text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            {/* Rows */}
            <div>
              {loading ? (
                [0,1,2,3,4].map(i => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="mt-3 text-sm text-slate-400">No tickets found</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filtered.map((ticket, i) => (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-100"
                    >
                      <div className="flex-1 min-w-0 pr-4 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                        <div className="flex items-center gap-2 mb-1">
                          <PriorityDot priority={ticket.priority} />
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate hover:text-primary transition-colors">{ticket.issue}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>{ticket.name}</span>
                          {ticket.tags?.map(tag => (
                            <span key={tag} className="badge-tag">{tag}</span>
                          ))}
                          {ticket.createdAt && (
                            <span className="text-slate-400 dark:text-slate-500">
                              · {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Assignee Avatar */}
                        {ticket.assignedTo && (
                           <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800" title={`Assigned to ${ticket.assignedTo.name}`}>
                              {ticket.assignedTo.name[0].toUpperCase()}
                           </div>
                        )}
                        <StatusBadge status={ticket.status} />

                        {/* Admin actions */}
                        {user?.role === "admin" && (
                          <div className="flex gap-1.5 ml-2">
                            {ticket.status !== "Resolved" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateStatus(ticket._id, "Resolved") }}
                                className="btn-secondary px-2.5 py-1 text-xs shadow-none border-transparent hover:border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100"
                              >
                                ✓ Resolve
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteTicket(ticket._id) }}
                              className="btn-danger px-2.5 py-1 text-xs shadow-none border-transparent hover:border-red-200 bg-transparent hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}

                        {/* Non-admin: only show resolve on own tickets */}
                        {user?.role !== "admin" && ticket.status === "Open" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(ticket._id, "Resolved") }}
                            className="btn-secondary px-2.5 py-1 text-xs shadow-none"
                          >
                            ✓ Mark Resolved
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateModal onClose={() => setShowModal(false)} onCreated={fetchTickets} />
        )}
        {selectedTicket && (
          <TicketSheet 
             ticket={selectedTicket} 
             users={users} 
             currentUser={user}
             onClose={() => setSelectedTicket(null)}
             onUpdate={handleTicketUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
