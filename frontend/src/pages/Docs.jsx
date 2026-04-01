import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const endpoints = [
  {
    method: "POST",
    path: "/api/tickets",
    desc: "Create a new support ticket",
    body: `{\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "issue": "Login not working"\n}`,
    response: `{\n  "_id": "65f...",\n  "status": "Open",\n  "createdAt": "2024-03-01T..."\n}`,
  },
  {
    method: "GET",
    path: "/api/tickets",
    desc: "Fetch all tickets (optional ?status=Open filter)",
    query: "?status=Open",
    response: `[ { "_id": "...", "name": "...", "status": "Open" } ]`,
  },
  {
    method: "PUT",
    path: "/api/tickets/:id",
    desc: "Update a ticket's status",
    body: `{ "status": "Resolved" }`,
    response: `{ "_id": "...", "status": "Resolved" }`,
  },
  {
    method: "DELETE",
    path: "/api/tickets/:id",
    desc: "Permanently delete a ticket",
    response: `{ "message": "Ticket deleted successfully" }`,
  },
  {
    method: "POST",
    path: "/api/register",
    desc: "Register a new user account",
    body: `{\n  "name": "Jane",\n  "email": "jane@example.com",\n  "password": "secret"\n}`,
    response: `{ "message": "User registered successfully" }`,
  },
  {
    method: "POST",
    path: "/api/login",
    desc: "Authenticate and get user info",
    body: `{\n  "email": "jane@example.com",\n  "password": "secret"\n}`,
    response: `{\n  "message": "Login successful",\n  "name": "Jane",\n  "role": "user"\n}`,
  },
];

const methodColors = {
  GET: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900",
  POST: "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900",
  PUT: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900",
  DELETE: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900",
};

function EndpointCard({ ep, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="card dark:bg-slate-800 dark:border-slate-700 overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
      >
        <span className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-bold border font-mono ${methodColors[ep.method]}`}>
          {ep.method}
        </span>
        <code className="text-sm font-mono text-slate-700 dark:text-slate-200 flex-1">{ep.path}</code>
        <span className="text-xs text-slate-400 hidden sm:block">{ep.desc}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-100 dark:border-slate-700 px-5 py-4 space-y-4"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">{ep.desc}</p>

          {ep.query && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Query Params</p>
              <code className="block bg-slate-50 dark:bg-slate-900/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                {ep.query}
              </code>
            </div>
          )}

          {ep.body && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Request Body</p>
              <pre className="bg-slate-50 dark:bg-slate-900/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 overflow-x-auto">
                {ep.body}
              </pre>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Response</p>
            <pre className="bg-slate-50 dark:bg-slate-900/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 overflow-x-auto">
              {ep.response}
            </pre>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">API Reference</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Documentation</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg">
            REST API running on <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">https://customer-helpdesk.onrender.com</code>.
            Click any endpoint to expand its details.
          </p>

          <div className="space-y-3">
            {endpoints.map((ep, i) => (
              <EndpointCard key={ep.method + ep.path} ep={ep} index={i} />
            ))}
          </div>

          <div className="mt-10 card dark:bg-slate-800 dark:border-slate-700 p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Base URL</h2>
            <code className="block bg-slate-50 dark:bg-slate-900/60 rounded-lg px-4 py-2.5 text-sm font-mono text-primary border border-slate-100 dark:border-slate-700">
              https://customer-helpdesk.onrender.com
            </code>
            <p className="mt-3 text-xs text-slate-400">All requests should include <code className="font-mono">Content-Type: application/json</code> in the headers.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
