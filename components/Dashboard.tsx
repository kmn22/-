import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CaseSubmission, CourtType } from '../types';
import { Scale, AlertTriangle, check, Clock, FileCheck } from 'lucide-react';

interface DashboardProps {
  cases: CaseSubmission[];
}

const Dashboard: React.FC<DashboardProps> = ({ cases }) => {
  const stats = {
    total: cases.length,
    urgent: cases.filter(c => c.analysis?.priority === 'مستعجلة').length,
    commercial: cases.filter(c => c.analysis?.courtType === CourtType.COMMERCIAL).length,
    labor: cases.filter(c => c.analysis?.courtType === CourtType.LABOR).length,
    personal: cases.filter(c => c.analysis?.courtType === CourtType.PERSONAL_STATUS).length,
  };

  const data = [
    { name: 'تجارية', value: stats.commercial, color: '#0ea5e9' }, // Sky 500
    { name: 'عمالية', value: stats.labor, color: '#f59e0b' },      // Amber 500
    { name: 'أحوال شخصية', value: stats.personal, color: '#ec4899' }, // Pink 500
    { name: 'أخرى', value: stats.total - (stats.commercial + stats.labor + stats.personal), color: '#64748b' } // Slate 500
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="إجمالي القضايا" 
            value={stats.total} 
            icon={<FileCheck className="text-white" />} 
            bg="bg-blue-600" 
        />
        <StatCard 
            title="قضايا مستعجلة" 
            value={stats.urgent} 
            icon={<AlertTriangle className="text-white" />} 
            bg="bg-red-500" 
        />
        <StatCard 
            title="تم الفرز آلياً" 
            value={stats.total} // Assuming all are processed for now
            icon={<Scale className="text-white" />} 
            bg="bg-emerald-500" 
        />
        <StatCard 
            title="متوسط زمن الفرز" 
            value="1.2 ث" 
            icon={<Clock className="text-white" />} 
            bg="bg-indigo-500" 
            isText
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">توزيع القضايا حسب المحكمة</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">مؤشر القضايا اليومي</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'أمس', count: 120}, {name: 'اليوم', count: stats.total + 45}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="عدد القضايا" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg, isText = false }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${bg}`}>
            {icon}
        </div>
    </div>
);

export default Dashboard;