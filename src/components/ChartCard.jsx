function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg h-[400px] flex flex-col ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;
