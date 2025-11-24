import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Users, MessageSquare, Phone, Activity, Smartphone, Shield, Wifi } from 'lucide-react';

const USER_PHONE_NUMBER = "+1-(408)-614-0468";

const data = [
  { name: 'Mon', messages: 4000, calls: 2400, amt: 2400 },
  { name: 'Tue', messages: 3000, calls: 1398, amt: 2210 },
  { name: 'Wed', messages: 2000, calls: 9800, amt: 2290 },
  { name: 'Thu', messages: 2780, calls: 3908, amt: 2000 },
  { name: 'Fri', messages: 1890, calls: 4800, amt: 2181 },
  { name: 'Sat', messages: 2390, calls: 3800, amt: 2500 },
  { name: 'Sun', messages: 3490, calls: 4300, amt: 2100 },
];

const activeUsers = [
  { time: '00:00', users: 120 },
  { time: '04:00', users: 80 },
  { time: '08:00', users: 450 },
  { time: '12:00', users: 980 },
  { time: '16:00', users: 850 },
  { time: '20:00', users: 600 },
];

const Card: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string; sub?: string }> = ({ title, value, icon, trend, sub }) => (
  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className="p-2 bg-slate-700 rounded-lg text-cyan-400">
        {icon}
      </div>
    </div>
    <div className="flex justify-between items-center">
        <p className="text-emerald-400 text-sm font-medium flex items-center gap-1">
        {trend}
        </p>
        {sub && <span className="text-xs text-slate-500 font-mono">{sub}</span>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const handleDownloadReport = () => {
    const report = JSON.stringify({ 
        account: USER_PHONE_NUMBER,
        timestamp: Date.now(),
        stats: data, 
        active_sessions: activeUsers,
        server_status: 'optimal' 
    }, null, 2);
    
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TechSkyline_DevReport_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Developer Backend</h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-900/50 text-cyan-400 border border-cyan-800">Admin</span>
             <p className="text-slate-400 text-sm">Tech Skyline System Monitor</p>
          </div>
        </div>
        
        <div className="flex gap-3">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-slate-400">Linked Account</span>
                <span className="text-sm font-mono text-white font-bold">{USER_PHONE_NUMBER}</span>
             </div>
            <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
            <Download className="w-4 h-4" />
            Export System Logs
            </button>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-cyan-900/40 border border-slate-700 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-white font-semibold text-lg">Primary Line Active</h3>
                <p className="text-slate-400">Calls and texts routed via <span className="text-cyan-400 font-mono">{USER_PHONE_NUMBER}</span></p>
            </div>
         </div>
         <div className="flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">Anti-Blocking: ON</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">Intl. Gateway</span>
             </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Total Users" value="124,592" icon={<Users className="w-5 h-5"/>} trend="+12.5% vs last week" />
        <Card title="Messages Processed" value="8.2M" icon={<MessageSquare className="w-5 h-5"/>} trend="+5.2% traffic" />
        <Card title="Active Calls" value="1,432" icon={<Phone className="w-5 h-5"/>} trend="VoIP Nodes: 45" sub="Latency: 12ms" />
        <Card title="System Health" value="99.9%" icon={<Activity className="w-5 h-5"/>} trend="All Systems Operational" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Global Traffic Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="messages" fill="#6366f1" radius={[4, 4, 0, 0]} name="Messages" />
                <Bar dataKey="calls" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Live Node Connections</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;