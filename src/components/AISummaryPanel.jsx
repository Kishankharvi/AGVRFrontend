import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, Minus, Target, Grip, Award } from 'lucide-react';
import { getUserAnalysis } from '../api/client';
import MetricCard from './MetricCard';

const TREND_CONFIG = {
  improving: { label: 'Improving', color: 'bg-emerald-500/20 text-emerald-400', icon: TrendingUp },
  declining: { label: 'Declining', color: 'bg-red-500/20 text-red-400', icon: TrendingDown },
  stable: { label: 'Stable', color: 'bg-amber-500/20 text-amber-400', icon: Minus },
  'insufficient data': { label: 'Insufficient Data', color: 'bg-slate-500/20 text-slate-400', icon: Minus },
};

function AISummaryPanel({ userId }) {
  const [analysis, setAnalysis] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getUserAnalysis(userId)
      .then(data => {
        if (cancelled) return;
        setAnalysis(data.analysis);
        setAiSummary(data.aiSummary);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('AI analysis failed:', err);
        setError('AI analysis unavailable. Check that the backend is running and GEMINI_API_KEY is set.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-400 font-semibold mb-1">Analysis Unavailable</h3>
          <p className="text-red-300/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const trend = TREND_CONFIG[analysis.accuracy_trend] || TREND_CONFIG['insufficient data'];
  const TrendIcon = trend.icon;
  const perExercise = analysis.per_exercise || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Accuracy" value={`${analysis.avg_accuracy}%`} sub={`Best: ${analysis.best_accuracy}%`} icon={<Target className="w-5 h-5 text-blue-400" />} />
        <StatCard label="Avg Grip" value={analysis.avg_grip.toFixed(1)} sub={`${analysis.session_count} sessions`} icon={<Grip className="w-5 h-5 text-purple-400" />} />
        <StatCard label="Best Accuracy" value={`${analysis.best_accuracy}%`} sub={`Worst: ${analysis.worst_accuracy}%`} icon={<Award className="w-5 h-5 text-emerald-400" />} />
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Trend</p>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${trend.color}`}>
              <TrendIcon className="w-4 h-4" />
              {trend.label}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Per-Exercise Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Exercise</th>
                <th className="p-4 font-medium text-right">Avg Accuracy</th>
                <th className="p-4 font-medium text-right">Avg Grip</th>
                <th className="p-4 font-medium text-right">Reps Completion</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(perExercise).map(([name, metrics]) => (
                <tr key={name} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{name.replace('Exercise', '')}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metrics.avg_accuracy >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      metrics.avg_accuracy >= 60 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {metrics.avg_accuracy}%
                    </span>
                  </td>
                  <td className="p-4 text-right text-purple-300">{metrics.avg_grip.toFixed(1)}</td>
                  <td className="p-4 text-right text-slate-300">{metrics.avg_reps_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 rounded-2xl border border-indigo-500/20 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-500/15 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Clinical Summary</h3>
            <p className="text-xs text-indigo-300/60">Powered by Gemini</p>
          </div>
        </div>
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
          {aiSummary.split('\n\n').filter(Boolean).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  );
}

export default AISummaryPanel;
