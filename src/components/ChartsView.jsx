import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import ChartCard from './ChartCard';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' },
  labelStyle: { color: '#94a3b8' },
};

const EXERCISE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

function ChartsView({ sessions, forecast, analysis }) {
  const chartData = useMemo(() => {
    return [...sessions].reverse().map((session, index) => ({
      name: `S${index + 1}`,
      date: format(parseISO(session.startTimestamp), 'MMM dd, HH:mm'),
      accuracy: session.overallAccuracy,
      gripStrength: session.averageGripStrength,
      duration: session.totalDuration,
    }));
  }, [sessions]);

  // Merge historical + forecast for the forecast chart
  const forecastChartData = useMemo(() => {
    const historical = chartData.map(d => ({
      name: d.name,
      accuracy: d.accuracy,
      predicted: null,
    }));

    const predicted = (forecast || []).map(f => ({
      name: f.session,
      accuracy: null,
      predicted: f.predicted_accuracy,
    }));

    // Bridge: duplicate last historical point into predicted series
    if (historical.length > 0 && predicted.length > 0) {
      const lastPoint = historical[historical.length - 1];
      predicted[0] = {
        ...predicted[0],
        accuracy: lastPoint.accuracy,
        predicted: predicted[0].predicted,
      };
      // Add bridge value to last historical point
      historical[historical.length - 1] = {
        ...lastPoint,
        predicted: lastPoint.accuracy,
      };
    }

    return [...historical, ...predicted];
  }, [chartData, forecast]);

  // Per-exercise bar chart data
  const perExerciseData = useMemo(() => {
    const perEx = analysis?.per_exercise || {};
    return Object.entries(perEx).map(([name, metrics]) => ({
      name: name.replace('Exercise', ''),
      accuracy: metrics.avg_accuracy,
      grip: metrics.avg_grip,
      repsPct: metrics.avg_reps_pct,
    }));
  }, [analysis]);

  // Radar data
  const radarData = useMemo(() => {
    const perEx = analysis?.per_exercise || {};
    return Object.entries(perEx).map(([name, metrics]) => ({
      exercise: name.replace('Exercise', ''),
      accuracy: metrics.avg_accuracy,
      grip: metrics.avg_grip,
    }));
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* Row 1: Accuracy + Grip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Overall Accuracy Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Grip Strength Analysis">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: '#334155', opacity: 0.4 }} />
              <Legend />
              <Bar dataKey="gripStrength" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Grip Strength" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Duration + Per-Exercise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Session Duration Trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Area type="monotone" dataKey="duration" stroke="#818cf8" strokeWidth={2} fill="url(#durationGradient)" name="Duration (s)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Per-Exercise Accuracy">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perExerciseData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
              <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: '#334155', opacity: 0.4 }} />
              <Legend />
              <Bar dataKey="accuracy" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Avg Accuracy %" />
              <Bar dataKey="repsPct" fill="#10b981" radius={[0, 4, 4, 0]} name="Reps Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Forecast + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Recovery Forecast">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Historical" connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} strokeDasharray="6 3" dot={{ r: 4 }} name="Predicted" connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Exercise Radar Overview">
          <ResponsiveContainer width="100%" height="100%">
            {radarData.length > 0 ? (
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="exercise" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
                <Radar name="Accuracy" dataKey="accuracy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                <Radar name="Grip" dataKey="grip" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Legend />
                <Tooltip {...TOOLTIP_STYLE} />
              </RadarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No exercise data available for radar chart
              </div>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export default ChartsView;
