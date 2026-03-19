import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../../redux/toastSlice";
import { AlertCircle, X } from "lucide-react";

const TOAST_DURATION_MS = 10000;

const Toast = () => {
  const { show, message, type } = useSelector((state) => state.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => dispatch(hideToast()), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [show, dispatch]);

  if (!show || !message) return null;

  const isError = type === "error";

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-lg max-w-[90vw] animate-fade-in pointer-events-auto shadow-2xl"
      aria-live="assertive"
    >
      <div
        className={`flex items-start gap-3 px-4 py-4 rounded-2xl border-2 ${
          isError
            ? "bg-red-50 dark:bg-red-950/90 border-red-500 text-red-800 dark:text-red-200"
            : "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-500 text-emerald-800 dark:text-emerald-200"
        }`}
      >
        <AlertCircle
          size={24}
          className={`shrink-0 ${isError ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
          aria-hidden
        />
        <p className="flex-1 font-medium text-sm leading-relaxed whitespace-pre-line">
          {message}
        </p>
        <button
          type="button"
          onClick={() => dispatch(hideToast())}
          className="p-1 rounded-lg hover:bg-black/10 transition-colors"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
