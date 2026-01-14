import React, { useState } from 'react';
import { CaseSubmission, CourtType } from '../types';
import { Search, X, User, FileText, Scale, Gavel, Calendar, CheckCircle2, AlertCircle, FileWarning, FileType } from 'lucide-react';

interface HistoryProps {
    cases: CaseSubmission[];
}

const History: React.FC<HistoryProps> = ({ cases }) => {
    const [selectedCase, setSelectedCase] = useState<CaseSubmission | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCases = cases.filter(c => 
        c.plaintiffName.includes(searchTerm) || 
        c.id.includes(searchTerm) ||
        c.description.includes(searchTerm)
    );

    const getCourtBadgeStyle = (courtType: string | undefined) => {
        if (!courtType) return 'bg-gray-100 text-gray-400 border-gray-200';
        
        switch (courtType) {
            case CourtType.COMMERCIAL: return 'bg-sky-50 text-sky-700 border-sky-100'; // Matches Dashboard Blue
            case CourtType.LABOR: return 'bg-amber-50 text-amber-700 border-amber-100'; // Matches Dashboard Amber
            case CourtType.PERSONAL_STATUS: return 'bg-pink-50 text-pink-700 border-pink-100'; // Matches Dashboard Pink
            case CourtType.EXECUTION: return 'bg-emerald-50 text-emerald-700 border-emerald-100'; // Execution Green
            case CourtType.GENERAL: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case CourtType.CRIMINAL: return 'bg-rose-50 text-rose-700 border-rose-100';
            case CourtType.ADMINISTRATIVE: return 'bg-teal-50 text-teal-700 border-teal-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">سجل الدعاوى</h2>
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="بحث برقم الدعوى أو الاسم..." 
                        className="pr-10 pl-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-judicial-100 w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="p-4 font-medium">#</th>
                            <th className="p-4 font-medium">المدعي</th>
                            <th className="p-4 font-medium">المحكمة المختصة</th>
                            <th className="p-4 font-medium">الأولوية</th>
                            <th className="p-4 font-medium">التاريخ</th>
                            <th className="p-4 font-medium">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCases.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">لا توجد قضايا مسجلة تطابق البحث</td>
                            </tr>
                        ) : (
                            filteredCases.map((c, i) => (
                                <tr 
                                    key={c.id} 
                                    onClick={() => setSelectedCase(c)}
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors text-sm group"
                                >
                                    <td className="p-4 font-mono text-gray-400 group-hover:text-judicial-600 transition-colors">{c.id}</td>
                                    <td className="p-4 font-bold text-gray-800">{c.plaintiffName}</td>
                                    <td className="p-4">
                                        {c.analysis && c.analysis.courtType ? (
                                            <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex w-fit items-center gap-1.5 ${getCourtBadgeStyle(c.analysis.courtType)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${getCourtBadgeStyle(c.analysis.courtType).replace('bg-', 'bg-current ').split(' ')[0]}`}></span>
                                                {c.analysis.courtType}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 font-normal text-xs bg-gray-50 px-2 py-1 rounded">قيد التحليل</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            c.analysis?.priority === 'مستعجلة' ? 'bg-red-100 text-red-600' : 
                                            c.analysis?.priority === 'متوسطة' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {c.analysis?.priority || 'تحت الإجراء'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">{new Date(c.date).toLocaleDateString('ar-SA')}</td>
                                    <td className="p-4">
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle2 size={14} /> تم التوجيه
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Case Details Modal */}
            {selectedCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black text-judicial-900">تفاصيل الدعوى</h2>
                                    <span className="font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-500 text-sm">{selectedCase.id}</span>
                                    {selectedCase.analysis?.extractedInfo && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200 flex items-center gap-1 font-bold">
                                            <FileType size={12} /> تم الاستخراج من ملف
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedCase.date).toLocaleDateString('ar-SA')}</span>
                                    <span className="flex items-center gap-1"><User size={14} /> المستلم: أحمد المحمد</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedCase(null)}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* Right Column: Case Data (2 cols) */}
                                <div className="lg:col-span-2 space-y-8">
                                    
                                    {/* Parties */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <User size={14} /> المدعي
                                            </h3>
                                            <p className="font-bold text-gray-800 text-lg">{selectedCase.plaintiffName}</p>
                                            <p className="text-gray-500 text-sm mt-1">{selectedCase.plaintiffId || 'رقم الهوية غير متوفر'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <User size={14} /> المدعى عليه
                                            </h3>
                                            <p className="font-bold text-gray-800 text-lg">{selectedCase.defendantName}</p>
                                            <p className="text-gray-500 text-sm mt-1">بيانات غير متوفرة</p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h3 className="text-lg font-bold text-judicial-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <FileText size={20} className="text-judicial-500" />
                                            مضمون الدعوى
                                        </h3>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 block mb-2">موضوع الدعوى</label>
                                                <div className="p-4 bg-white border border-gray-200 rounded-xl text-gray-800 font-medium shadow-sm">
                                                    {selectedCase.description}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-bold text-gray-700 block mb-2">الوقائع</label>
                                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                                    {selectedCase.facts || 'لا يوجد تفاصيل للوقائع'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-bold text-gray-700 block mb-2">الطلبات</label>
                                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 text-sm leading-relaxed">
                                                        {selectedCase.requests || 'لا يوجد طلبات محددة'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-gray-700 block mb-2">الأسانيد</label>
                                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 text-sm leading-relaxed">
                                                        {selectedCase.legalBasis || 'لم تذكر أسانيد'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Left Column: Analysis (1 col) */}
                                <div className="space-y-6">
                                    <div className="bg-judicial-50 p-6 rounded-3xl border border-judicial-100 sticky top-0">
                                        <h3 className="text-judicial-900 font-bold mb-6 flex items-center gap-2">
                                            <Scale size={20} />
                                            التحليل الآلي
                                        </h3>

                                        {selectedCase.analysis ? (
                                            <div className="space-y-6">
                                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-judicial-100/50">
                                                    <label className="text-xs font-bold text-gray-400 block mb-1">المحكمة المختصة</label>
                                                    <div className={`text-lg font-black p-3 rounded-xl border ${getCourtBadgeStyle(selectedCase.analysis.courtType)}`}>
                                                        {selectedCase.analysis.courtType}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                                                        <label className="text-xs font-bold text-gray-400 block mb-1">الأولوية</label>
                                                        <p className={`font-bold ${
                                                            selectedCase.analysis.priority === 'مستعجلة' ? 'text-red-600' : 'text-gray-700'
                                                        }`}>{selectedCase.analysis.priority}</p>
                                                    </div>
                                                    {selectedCase.analysis.isLikelyMalicious && (
                                                        <div className="flex-1 bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center justify-center">
                                                            <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                                                                <FileWarning size={14} /> اشتباه كيدية
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 block mb-2">التحقق من المتطلبات</label>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            {selectedCase.analysis.requirementsCheck?.hasClearFacts 
                                                                ? <CheckCircle2 size={16} className="text-green-500" />
                                                                : <AlertCircle size={16} className="text-orange-500" />
                                                            }
                                                            <span className="text-gray-600">وضوح الوقائع</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            {selectedCase.analysis.requirementsCheck?.hasClearRequest
                                                                ? <CheckCircle2 size={16} className="text-green-500" />
                                                                : <AlertCircle size={16} className="text-orange-500" />
                                                            }
                                                            <span className="text-gray-600">وضوح الطلبات</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 block mb-2">سبب التوجيه</label>
                                                    <p className="text-sm text-gray-600 bg-white/50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                                                        {selectedCase.analysis.reasoning}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 block mb-2">الكلمات المفتاحية</label>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedCase.analysis.keywords?.map((k, i) => (
                                                            <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600">
                                                                {k}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <div className="bg-white p-4 rounded-full inline-block mb-2">
                                                    <Scale size={24} className="text-gray-300" />
                                                </div>
                                                <p>لا يوجد تحليل متوفر لهذه الدعوى بعد</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedCase(null)}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                إغلاق
                            </button>
                            <button className="px-6 py-2.5 bg-judicial-600 text-white rounded-xl font-bold hover:bg-judicial-700 transition-colors flex items-center gap-2 shadow-lg shadow-judicial-500/20">
                                <Gavel size={18} />
                                فتح في نظام ناجز
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;