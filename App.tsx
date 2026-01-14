import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewCase from './components/NewCase';
import History from './components/History';
import { CaseSubmission, CourtType, CasePriority } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Seed data for better initial visualization
  const [cases, setCases] = useState<CaseSubmission[]>([
    {
        id: '99283-A',
        plaintiffName: 'شركة البناء الحديثة',
        plaintiffId: '7001234567',
        defendantName: 'مؤسسة التوريد السريع',
        description: 'عدم دفع مستحقات توريد أسمنت',
        facts: 'تم توريد أسمنت بقيمة 500 ألف ريال بتاريخ 1-1-2023 ولم يتم السداد.',
        requests: 'إلزام المدعى عليه بسداد المبلغ + التعويض.',
        legalBasis: 'العقد المبرم بين الطرفين.',
        date: '2023-10-25T10:00:00Z',
        status: 'analyzed',
        analysis: {
            courtType: CourtType.COMMERCIAL,
            priority: CasePriority.MEDIUM,
            summary: 'مطالبة مالية تجارية بقيمة 500 ألف ريال مقابل توريد مواد بناء.',
            reasoning: 'نزاع مالي بين كيانين تجاريين يدخل ضمن اختصاص المحاكم التجارية.',
            keywords: ['توريد', 'مستحقات', 'عقد تجاري'],
            isLikelyMalicious: false,
            legalGrounds: 'العقد التجاري وأنظمة المحكمة التجارية',
            requirementsCheck: {
                hasClearFacts: true,
                hasClearRequest: true,
                missingElements: []
            }
        }
    },
    {
        id: '11202-B',
        plaintiffName: 'سارة أحمد محمد',
        plaintiffId: '1012345678',
        defendantName: 'خالد علي عبدالله',
        description: 'طلب حضانة أطفال مستعجل',
        facts: 'الأب يهدد بالسفر بالمحضون خارج المملكة دون إذن.',
        requests: 'إثبات الحضانة ومنع السفر.',
        legalBasis: 'نظام الأحوال الشخصية.',
        date: '2023-10-26T09:00:00Z',
        status: 'analyzed',
        analysis: {
            courtType: CourtType.PERSONAL_STATUS,
            priority: CasePriority.HIGH,
            summary: 'طلب حضانة مستعجل لوجود خطر سفر الأب بالمحضون.',
            reasoning: 'قضايا الحضانة وخطر السفر تعتبر من الأمور المستعجلة في الأحوال الشخصية.',
            keywords: ['حضانة', 'سفر', 'مستعجل'],
            isLikelyMalicious: false,
            legalGrounds: 'نظام الأحوال الشخصية ومصلحة المحضون',
            requirementsCheck: {
                hasClearFacts: true,
                hasClearRequest: true,
                missingElements: []
            }
        }
    },
    {
        id: '55401-C',
        plaintiffName: 'بنك الرياض',
        plaintiffId: '7000100200',
        defendantName: 'مؤسسة صالح للتجارة',
        description: 'تنفيذ شيك بدون رصيد',
        facts: 'تقدم البنك بشيك مصدق بمبلغ 200,000 ريال، وتم رفضه لعدم كفاية الرصيد.',
        requests: 'التنفيذ الجبري ومخاطبة الجهات المختصة للحجز.',
        legalBasis: 'ورقة تجارية (شيك) مستوفية الشروط.',
        date: '2023-10-27T11:30:00Z',
        status: 'analyzed',
        analysis: {
            courtType: CourtType.EXECUTION,
            priority: CasePriority.HIGH,
            summary: 'طلب تنفيذ شيك بدون رصيد.',
            reasoning: 'الشيكات والأوراق التجارية تعتبر سندات تنفيذية تختص بها محكمة التنفيذ.',
            keywords: ['شيك', 'تنفيذ', 'سند تنفيذي'],
            isLikelyMalicious: false,
            legalGrounds: 'نظام التنفيذ ولائحته',
            requirementsCheck: {
                hasClearFacts: true,
                hasClearRequest: true,
                missingElements: []
            }
        }
    }
  ]);

  const handleNewCase = (newCase: CaseSubmission) => {
    setCases(prev => [newCase, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mr-64 p-8 min-h-screen">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-judicial-900">
                    {activeTab === 'dashboard' && 'لوحة المعلومات'}
                    {activeTab === 'new-case' && 'قيد دعوى جديدة'}
                    {activeTab === 'history' && 'سجل القضايا'}
                    {activeTab === 'settings' && 'الإعدادات'}
                </h1>
                <p className="text-gray-500 mt-2">نظام الفرز والتوجيه القضائي المدعوم بالذكاء الاصطناعي</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="text-left">
                    <p className="font-bold text-sm text-judicial-900">أحمد المحمد</p>
                    <p className="text-xs text-gray-500">موظف استقبال الدعاوى</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-judicial-200 border-2 border-white shadow-sm flex items-center justify-center text-judicial-700 font-bold">
                    أ
                </div>
            </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard cases={cases} />}
        {activeTab === 'new-case' && <NewCase onCaseAnalyzed={handleNewCase} existingCases={cases} />}
        {activeTab === 'history' && <History cases={cases} />}
        {activeTab === 'settings' && (
            <div className="bg-white p-12 rounded-2xl text-center text-gray-400 border border-dashed border-gray-200">
                صفحة الإعدادات (قيد التطوير)
            </div>
        )}
      </main>
    </div>
  );
};

export default App;