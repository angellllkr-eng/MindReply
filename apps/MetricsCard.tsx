export function MetricsCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-sm text-green-600 mt-1">{trend}</p>
    </div>
  );
}