import React from 'react';

function MetricCard({ title, value, icon, trend }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-start justify-between relative overflow-hidden group hover:border-slate-600 transition-all">
      <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
        {React.cloneElement(icon, { className: 'w-32 h-32' })}
      </div>
      <div>
        <p className="text-slate-400 font-medium mb-1">{title}</p>
        <h3 className="text-4xl font-bold tracking-tight text-white mb-2">{value}</h3>
        <p className="text-sm text-slate-500">{trend}</p>
      </div>
      <div className="p-3 bg-slate-900 rounded-xl">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
    </div>
  );
}

export default MetricCard;
