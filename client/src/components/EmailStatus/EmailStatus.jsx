export default function EmailStatus({ message, type = 'info' }) {
  const styles = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  if (!message) return null;

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>{message}</div>
  );
}
