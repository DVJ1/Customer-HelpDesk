import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";

function StatusBadge({ status }) {
  const map = {
    Open: "badge-open",
    "In Progress": "badge-in-progress",
    Resolved: "badge-resolved",
  };
  return <span className={map[status] || "badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}>{status}</span>;
}

function PriorityIcon({ priority }) {
  const map = {
    Low: "bg-blue-200 text-blue-700",
    Medium: "bg-amber-200 text-amber-700",
    High: "bg-red-200 text-red-700",
  };
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className={`w-2 h-2 rounded-full ${map[priority] || "bg-slate-400"}`} />
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{priority}</span>
    </div>
  );
}

export default function TicketSheet({ ticket, onClose, users, onUpdate, currentUser }) {
  const toast = useToast();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localTicket, setLocalTicket] = useState(ticket);

  useEffect(() => {
    setLocalTicket(ticket);
  }, [ticket]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const res = await axios.put(`http://localhost:5000/api/tickets/${localTicket._id}`, {
        status: newStatus,
        actionUser: currentUser?.name || "System"
      });
      setLocalTicket(res.data);
      onUpdate(res.data);
      toast("Status updated", "success");
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const handleAssignChange = async (e) => {
    const newAssignee = e.target.value || null;
    try {
      const res = await axios.put(`http://localhost:5000/api/tickets/${localTicket._id}`, {
        assignedTo: newAssignee,
        actionUser: currentUser?.name || "System"
      });
      setLocalTicket(res.data);
      onUpdate(res.data);
      toast("Assignee updated", "success");
    } catch {
      toast("Failed to assign ticket", "error");
    }
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/tickets/${localTicket._id}/comments`, {
        text: comment,
        user: currentUser?.name || "Anonymous",
        role: currentUser?.role || "user"
      });
      setLocalTicket(res.data);
      onUpdate(res.data);
      setComment("");
    } catch {
      toast("Failed to add comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Combine and sort activities and comments for timeline
  const timeline = [
    ...(localTicket.activities || []).map(a => ({ ...a, type: 'activity' })),
    ...(localTicket.comments || []).map(c => ({ ...c, type: 'comment' }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ticket Details</h2>
            <p className="text-xs text-slate-500">ID: {localTicket._id.slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Metadata Bar */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">{localTicket.issue}</h3>
                <p className="text-sm text-slate-500 mt-1">Reported by {localTicket.name} ({localTicket.email})</p>
                
                {localTicket.tags && localTicket.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {localTicket.tags.map(t => <span key={t} className="badge-tag">{t}</span>)}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              {/* Status Select */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                <select 
                  value={localTicket.status} 
                  onChange={handleStatusChange}
                  disabled={currentUser?.role !== "admin"}
                  className="input py-1.5 text-xs bg-slate-50 cursor-pointer disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Assignee Select */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Assignee</label>
                <select 
                  value={localTicket.assignedTo?._id || ""} 
                  onChange={handleAssignChange}
                  disabled={currentUser?.role !== "admin"}
                  className="input py-1.5 text-xs bg-slate-50 cursor-pointer disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              
              {/* Priority */}
              <div className="col-span-2 flex items-center gap-3">
                 <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Priority:</label>
                 <PriorityIcon priority={localTicket.priority} />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Activity Timeline</h4>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-700">
              
              {timeline.length === 0 && (
                <p className="text-xs text-slate-400 text-center relative z-10 py-4 bg-white dark:bg-slate-900 rounded-lg">No activity yet</p>
              )}

              {timeline.map((item, i) => (
                <div key={i} className="relative flex items-start gap-4 z-10">
                  {item.type === 'activity' ? (
                     <>
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                           <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                        </div>
                        <div className="flex-1 mt-1">
                           <p className="text-xs text-slate-600 dark:text-slate-300">
                             <span className="font-medium text-slate-900 dark:text-white">{item.user}</span> {item.action}
                           </p>
                           <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                     </>
                  ) : (
                     <>
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white dark:border-slate-900 flex items-center justify-center shrink-0 shadow-sm text-primary font-bold text-xs">
                           {item.user?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl rounded-tl-none p-3 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                           <div className="flex items-center justify-between mb-1 gap-2">
                             <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.user}</span>
                             <span className="text-[10px] text-slate-400 shrink-0">{new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                           </div>
                           <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{item.text}</p>
                        </div>
                     </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reply Box */}
        {currentUser && (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-end gap-2">
              <textarea 
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a reply..."
                className="input resize-none py-2 min-h-[44px] max-h-32 text-sm"
                rows={1}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
              />
              <button 
                onClick={submitComment}
                disabled={submitting || !comment.trim()}
                className="btn-primary h-[44px] w-[44px] shrink-0 p-0 rounded-lg justify-center shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 -mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Enter</kbd> to reply</p>
          </div>
        )}
      </motion.div>
    </>
  );
}
