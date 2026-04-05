import { Activity, BarChart3, Brain, Users } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'ai-report', label: 'AI Report', icon: Brain },
];

function Sidebar({ patients, selectedPatient, onSelectPatient, activeTab, onTabChange }) {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          AGVR Rehab
        </h1>
        <p className="text-xs text-slate-500 mt-1">Rehabilitation Dashboard</p>
      </div>

      <div className="p-4 border-b border-slate-800">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center mb-2">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          Patient
        </label>
        <select
          value={selectedPatient}
          onChange={(e) => onSelectPatient(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        >
          {patients.length === 0 ? (
            <option disabled value="">No patients found</option>
          ) : (
            patients.map(p => (
              <option key={p} value={p}>{p}</option>
            ))
          )}
        </select>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          API Connected
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
