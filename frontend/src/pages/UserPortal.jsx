import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import TicketSheet from "../components/TicketSheet";

function StatusBadge({ status }) {
  const map = {
    Open: "badge-open",
    "In Progress": "badge-in-progress",
    Resolved: "badge-resolved",
  };
  return <span className={map[status] || "badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}>{status}</span>;
}

export default function UserPortal() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const toast = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      setUser(JSON.parse(u));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchTickets = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get(`https://customer-helpdesk.onrender.com/api/tickets?email=${user.email}`);
      setTickets(res.data);
    } catch {
      toast("Could not load your tickets", "error");
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user, fetchTickets]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleTicketUpdate = (updatedTicket) => {
    setTickets(t => t.map(x => x._id === updatedTicket._id ? updatedTicket : x));
    if (selectedTicket?._id === updatedTicket._id) {
       setSelectedTicket(updatedTicket);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col">
      {/* Top Navbar specifically for Portal */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Help<span className="text-primary">Desk</span><span className="text-primary">.</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {dark ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
          </button>
          
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
               {user?.name?.[0]?.toUpperCase()}
             </div>
             <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">{user?.name}</span>
             <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-600 font-medium ml-2">Log out</button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My Support Tickets</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage your requests.</p>
          </div>
          <Link to="/tickets" className="btn-primary">
            + Raise New Issue
          </Link>
        </div>

        {/* Tickets List */}
        <div className="card dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 animate-pulse">Loading your tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl mb-4">📭</div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">No tickets yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">You haven't submitted any support requests. If you need help, feel free to raise an issue!</p>
              <Link to="/tickets" className="btn-secondary">Raise an Issue</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {tickets.map((ticket, i) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-[15px] font-medium text-slate-900 dark:text-white truncate mb-1">{ticket.issue}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>ID: {ticket._id.slice(-6).toUpperCase()}</span>
                      <span>·</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={ticket.status} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedTicket && (
          <TicketSheet 
             ticket={selectedTicket} 
             users={[]} 
             currentUser={user}
             onClose={() => setSelectedTicket(null)}
             onUpdate={handleTicketUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
