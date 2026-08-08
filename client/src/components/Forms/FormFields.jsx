export default function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error.message || error}</p>}
    </div>
  );
}

export function TextArea({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error.message || error}</p>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error.message || error}</p>}
    </div>
  );
}
