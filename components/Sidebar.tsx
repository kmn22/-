import React from 'react';
import { LayoutDashboard, FileText, History, Settings, Scale } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة المعلومات', icon: <LayoutDashboard size={20} /> },
    { id: 'new-case', label: 'قيد دعوى جديدة', icon: <FileText size={20} /> },
    { id: 'history', label: 'سجل القضايا', icon: <History size={20} /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-judicial-900 text-white h-screen fixed right-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 flex items-center gap-3 border-b border-judicial-800">
        <div className="bg-white p-2 rounded-lg text-judicial-900">
            <Scale size={24} strokeWidth={2.5} />
        </div>
        <div>
            <h1 className="text-xl font-bold">المصنف القضائي</h1>
            <p className="text-xs text-judicial-100 opacity-70">نظام الفرز الذكي</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-judicial-500 text-white shadow-lg shadow-judicial-900/50'
                : 'text-judicial-100 hover:bg-judicial-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-judicial-800">
        <div className="bg-judicial-800/50 rounded-lg p-3 text-sm text-judicial-100">
            <p className="font-bold mb-1">حالة النظام</p>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>متصل بالذكاء الاصطناعي</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;