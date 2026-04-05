import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Activity, Brain, Clock } from 'lucide-react';
import { getUsers, getUserSessions, getUserForecast, getUserAnalysis } from './api/client';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import ChartsView from './components/ChartsView';
import AISummaryPanel from './components/AISummaryPanel';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [sessionsData, setSessionsData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        if (data.length > 0) {
          setSelectedUser(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchData = async () => {
      try {
        const [sessionsRes, forecastRes] = await Promise.allSettled([
          getUserSessions(selectedUser),
          getUserForecast(selectedUser),
        ]);

        if (sessionsRes.status === 'fulfilled') {
          setSessionsData(sessionsRes.value);
        }

        if (forecastRes.status === 'fulfilled') {
          setForecast(forecastRes.value.forecast || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    const fetchAnalysis = async () => {
      try {
        const data = await getUserAnalysis(selectedUser);
        setAnalysis(data.analysis);
      } catch {
        setAnalysis(null);
      }
    };

    fetchData();
    fetchAnalysis();
  }, [selectedUser]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Loading Dashboard...
        </div>
      </div>
    );
  }

  const sessions = sessionsData?.sessions || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-50">
      <Sidebar
        users={users}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 overflow-y-auto p-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-20 rounded-2xl border border-slate-800 bg-slate-800/50 mt-10">
            <Activity className="w-16 h-16 mb-4 text-slate-600" />
            <p className="text-xl">No session data available for this user.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'charts' && 'Analytics & Charts'}
                {activeTab === 'ai-report' && 'AI Clinical Report'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">User: {selectedUser}</p>
            </div>

            {activeTab === 'overview' && <OverviewView sessions={sessions} />}
            {activeTab === 'charts' && <ChartsView sessions={sessions} forecast={forecast} analysis={analysis} />}
            {activeTab === 'ai-report' && <AISummaryPanel userId={selectedUser} />}
          </div>
        )}
      </main>
    </div>
  );
}

function OverviewView({ sessions }) {
  const avgAccuracy = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + s.overallAccuracy, 0) / sessions.length).toFixed(1)
    : 0;

  const avgGrip = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + s.averageGripStrength, 0) / sessions.length).toFixed(1)
    : 0;

  const totalDuration = sessions.reduce((acc, s) => acc + s.totalDuration, 0).toFixed(0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Sessions"
          value={sessions.length}
          icon={<Activity className="text-blue-400" />}
          trend="Completed VR tasks"
        />
        <MetricCard
          title="Avg Accuracy"
          value={`${avgAccuracy}%`}
          icon={<Brain className="text-emerald-400" />}
          trend="Across all exercises"
        />
        <MetricCard
          title="Total Time in VR"
          value={`${totalDuration}s`}
          icon={<Clock className="text-purple-400" />}
          trend="Active rehabilitation"
        />
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Recent Sessions History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-sm">
                <th className="p-4 font-medium">Session ID</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium text-right">Accuracy</th>
                <th className="p-4 font-medium text-right">Grip</th>
                <th className="p-4 font-medium text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.sessionId} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 font-mono text-xs text-blue-300">{session.sessionId.substring(0, 8)}...</td>
                  <td className="p-4 text-sm">{format(parseISO(session.startTimestamp), 'MMM do, yyyy HH:mm')}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.overallAccuracy >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {session.overallAccuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-4 text-right text-purple-300">{session.averageGripStrength.toFixed(1)}</td>
                  <td className="p-4 text-right text-slate-300">{session.totalDuration.toFixed(0)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
