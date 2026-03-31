import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-toast-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium min-w-[260px] max-w-xs cursor-pointer select-none
            ${t.type === "success" ? "bg-white border-green-100 text-slate-800" : ""}
            ${t.type === "error" ? "bg-white border-red-100 text-slate-800" : ""}
            ${t.type === "info" ? "bg-white border-blue-100 text-slate-800" : ""}
            ${t.type === "warning" ? "bg-white border-amber-100 text-slate-800" : ""}
          `}
          onClick={() => dismiss(t.id)}
        >
          <span className="text-base shrink-0">
            {t.type === "success" && "✅"}
            {t.type === "error" && "❌"}
            {t.type === "info" && "ℹ️"}
            {t.type === "warning" && "⚠️"}
          </span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
