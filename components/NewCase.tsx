import React, { useState } from 'react';
import { analyzeCaseDescription } from '../services/geminiService';
import { CaseSubmission, CasePriority } from '../types';
import { Loader2, Send, AlertOctagon, CheckCircle2, Copy, FileWarning, ArrowRightLeft, Scale, Info, CheckSquare, BookOpen, AlertCircle, User, Users, FileText, Briefcase, Gavel, UploadCloud, FileType } from 'lucide-react';

interface NewCaseProps {
  onCaseAnalyzed: (newCase: CaseSubmission) => void;
  existingCases: CaseSubmission[];
}

const NewCase: React.FC<NewCaseProps> = ({ onCaseAnalyzed, existingCases }) => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload'>('manual');
  
  // Form State
  const [subject, setSubject] = useState(''); // موضوع الدعوى
  const [plaintiff, setPlaintiff] = useState(''); // المدعي
  const [plaintiffId, setPlaintiffId] = useState(''); // هوية المدعي
  const [defendant, setDefendant] = useState(''); // المدعى عليه
  const [facts, setFacts] = useState(''); // الوقائع
  const [requests, setRequests] = useState(''); // الطلبات
  const [legalBasis, setLegalBasis] = useState(''); // الأسانيد

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaseSubmission | null>(null);
  const [potentialDuplicate, setPotentialDuplicate] = useState<CaseSubmission | null>(null);

  // Manual Check States
  const [hasDocs, setHasDocs] = useState(false);
  const [hasFees, setHasFees] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);

      // Create preview if image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFilePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove 'data:mime/type;base64,' prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setPotentialDuplicate(null);

    try {
        let analysis;
        
        if (inputMethod === 'upload' && selectedFile) {
            // File Upload Flow
            const base64Data = await fileToBase64(selectedFile);
            analysis = await analyzeCaseDescription({
                media: {
                    mimeType: selectedFile.type,
                    data: base64Data
                },
                text: "قم باستخراج بيانات الدعوى بدقة من هذا الملف وتصنيفها."
            });

            // Auto-fill form from extraction
            if (analysis.extractedInfo) {
                setPlaintiff(analysis.extractedInfo.plaintiffName || '');
                setPlaintiffId(analysis.extractedInfo.plaintiffId || '');
                setDefendant(analysis.extractedInfo.defendantName || '');
                setSubject(analysis.extractedInfo.subject || 'مستخرج من الملف');
                setFacts(analysis.extractedInfo.facts || '');
                setRequests(analysis.extractedInfo.requests || '');
                setLegalBasis(analysis.extractedInfo.legalBasis || '');
            }

        } else {
            // Manual Flow
            if (!subject.trim() || !facts.trim() || !requests.trim()) return;
             
            const fullDescription = `
            موضوع الدعوى: ${subject}
            الوقائع: ${facts}
            الطلبات: ${requests}
            الأسانيد: ${legalBasis}
            المدعي: ${plaintiff}
            المدعى عليه: ${defendant}
            `;
            
            analysis = await analyzeCaseDescription(fullDescription);
        }

        // Duplicate Check (Logic reused)
        const currentPlaintiff = inputMethod === 'upload' && analysis.extractedInfo?.plaintiffName ? analysis.extractedInfo.plaintiffName : plaintiff;
        const currentDesc = inputMethod === 'upload' && analysis.extractedInfo?.facts ? analysis.extractedInfo.facts : facts;

        const duplicate = existingCases.find(c => 
            c.plaintiffName === currentPlaintiff && 
            c.status !== 'pending' &&
            (c.description.includes(subject.substring(0, 20)) || (c.facts && c.facts.includes(currentDesc.substring(0,20))))
        );

        if (duplicate) {
            setPotentialDuplicate(duplicate);
        }

        const newCase: CaseSubmission = {
            id: Math.random().toString(36).substr(2, 9),
            plaintiffName: inputMethod === 'upload' && analysis.extractedInfo?.plaintiffName ? analysis.extractedInfo.plaintiffName : plaintiff,
            plaintiffId: inputMethod === 'upload' && analysis.extractedInfo?.plaintiffId ? analysis.extractedInfo.plaintiffId : plaintiffId,
            defendantName: inputMethod === 'upload' && analysis.extractedInfo?.defendantName ? analysis.extractedInfo.defendantName : defendant,
            description: inputMethod === 'upload' && analysis.extractedInfo?.subject ? analysis.extractedInfo.subject : subject,
            facts: inputMethod === 'upload' && analysis.extractedInfo?.facts ? analysis.extractedInfo.facts : facts,
            requests: inputMethod === 'upload' && analysis.extractedInfo?.requests ? analysis.extractedInfo.requests : requests,
            legalBasis: inputMethod === 'upload' && analysis.extractedInfo?.legalBasis ? analysis.extractedInfo.legalBasis : legalBasis,
            date: new Date().toISOString(),
            status: 'analyzed',
            analysis: analysis
        };

        setResult(newCase);
        onCaseAnalyzed(newCase);
        
        // If upload success, switch view to see the extracted data but keep method to show we came from upload
        if (inputMethod === 'upload') {
            // Optional: You could switch to manual tab to show the filled fields, but showing result is better
        }

    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي. تأكد من صلاحية الملف (PDF/Image) وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setSubject('');
    setPlaintiff('');
    setPlaintiffId('');
    setDefendant('');
    setFacts('');
    setRequests('');
    setLegalBasis('');
    setPotentialDuplicate(null);
    setHasDocs(false);
    setHasFees(false);
    setSelectedFile(null);
    setFilePreview(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Left: Input Form (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-fit">
            
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-judicial-100 text-judicial-800 p-2 rounded-lg"><FileText size={20} /></span>
                    قيد دعوى جديدة
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setInputMethod('manual')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${inputMethod === 'manual' ? 'bg-white text-judicial-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        إدخال يدوي
                    </button>
                    <button 
                         onClick={() => setInputMethod('upload')}
                         className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${inputMethod === 'upload' ? 'bg-white text-judicial-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <UploadCloud size={14} />
                        رفع ملف
                    </button>
                </div>
            </div>
            
            <form onSubmit={handleAnalyze} className="space-y-6">
                
                {inputMethod === 'upload' ? (
                     <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="border-2 border-dashed border-judicial-200 rounded-xl bg-judicial-50/50 p-10 text-center hover:bg-judicial-50 transition-colors">
                            <input 
                                type="file" 
                                id="file-upload" 
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-judicial-500 mb-4">
                                    <UploadCloud size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-judicial-900">اضغط لرفع ملف الدعوى</h3>
                                <p className="text-sm text-judicial-600 mt-1">يدعم الصور (PNG, JPG) وملفات PDF</p>
                                <span className="text-xs text-gray-400 mt-4">سيقوم الذكاء الاصطناعي بقراءة الملف واستخراج البيانات آلياً</span>
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold shrink-0">
                                    {selectedFile.type.includes('pdf') ? 'PDF' : 'IMG'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 truncate">{selectedFile.name}</h4>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button type="button" onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1 rounded-lg">
                                    حذف
                                </button>
                            </div>
                        )}
                        
                        {filePreview && (
                            <div className="rounded-xl overflow-hidden border border-gray-200 max-h-48 bg-gray-50 flex justify-center">
                                <img src={filePreview} alt="Preview" className="h-full object-contain" />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading || !selectedFile}
                            className="w-full bg-judicial-800 hover:bg-judicial-900 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-judicial-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'تحليل المستند واستخراج البيانات'}
                        </button>
                     </div>
                ) : (
                    <>
                        {/* Section 1: Parties */}
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                                <Users size={16} /> بيانات الأطراف
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">اسم المدعي</label>
                                    <input 
                                        type="text" 
                                        value={plaintiff}
                                        onChange={(e) => setPlaintiff(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-judicial-500 focus:ring-1 focus:ring-judicial-500 outline-none transition-all text-sm"
                                        placeholder="الاسم الثلاثي..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">رقم الهوية / السجل التجاري</label>
                                    <input 
                                        type="text" 
                                        value={plaintiffId}
                                        onChange={(e) => setPlaintiffId(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-judicial-500 focus:ring-1 focus:ring-judicial-500 outline-none transition-all text-sm"
                                        placeholder="70xxxxxxxx..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">اسم المدعى عليه</label>
                                    <input 
                                        type="text" 
                                        value={defendant}
                                        onChange={(e) => setDefendant(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-judicial-500 focus:ring-1 focus:ring-judicial-500 outline-none transition-all text-sm"
                                        placeholder="اسم الشخص أو المؤسسة..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-4"></div>

                        {/* Section 2: Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                                <Briefcase size={16} /> موضوع وتفاصيل الدعوى
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">موضوع الدعوى</label>
                                <input 
                                    type="text" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-judicial-500 focus:ring-1 focus:ring-judicial-500 outline-none transition-all text-sm font-bold text-judicial-900"
                                    placeholder="مثال: مطالبة مالية، فسخ عقد، حضانة..."
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">الوقائع (تسلسل الأحداث)</label>
                                <textarea 
                                    value={facts}
                                    onChange={(e) => setFacts(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-judicial-500 focus:ring-1 focus:ring-judicial-500 outline-none transition-all h-24 text-sm resize-none bg-gray-50/50"
                                    placeholder="أذكر تفاصيل الواقعة والتواريخ المهمة بوضوح..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">الطلبات (ماذا تريد من المحكمة؟)</label>
                                    <textarea 
                                        value={requests}
                                        onChange={(e) => setRequests(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-judicial-500 focus:ring-1 focus:ring-judicial-500 outline-none transition-all h-24 text-sm resize-none bg-blue-50/30"
                                        placeholder="مثال: إلزام المدعى عليه بدفع مبلغ..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">الأسانيد (المستند النظامي أو الشرعي)</label>
                                    <textarea 
                                        value={legalBasis}
                                        onChange={(e) => setLegalBasis(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-judicial-500 focus:ring-1 focus:ring-judicial-500 outline-none transition-all h-24 text-sm resize-none bg-gray-50/50"
                                        placeholder="مثال: العقد، المادة رقم (..) من نظام..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Attachments & Signature */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase">المرفقات والإقرار</h3>
                            <div className="flex flex-wrap gap-4">
                                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-all text-xs select-none ${hasDocs ? 'bg-white border-green-300 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}>
                                    <input type="checkbox" checked={hasDocs} onChange={e => setHasDocs(e.target.checked)} className="hidden" />
                                    {hasDocs ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                                    المستندات الداعمة (عقود، فواتير، هوية)
                                </label>
                                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-all text-xs select-none ${hasFees ? 'bg-white border-green-300 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}>
                                    <input type="checkbox" checked={hasFees} onChange={e => setHasFees(e.target.checked)} className="hidden" />
                                    {hasFees ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                                    إيصال سداد الرسوم القضائية
                                </label>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-200">
                                <span>التاريخ: {new Date().toLocaleDateString('ar-SA')}</span>
                                <span className="font-tajawal font-bold">توقيع المدعي: {plaintiff || '................'}</span>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading || !subject || !facts || !requests}
                            className="w-full bg-judicial-800 hover:bg-judicial-900 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-judicial-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'تدقيق وقيد الدعوى آلياً'}
                        </button>
                    </>
                )}
            </form>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                    <AlertOctagon size={20} />
                    <p>{error}</p>
                </div>
            )}
          </div>
      </div>

      {/* Right: Results Panel (5 cols) */}
      <div className={`lg:col-span-5 transition-all duration-500 ${result ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-4 grayscale'}`}>
        {result && result.analysis ? (
             <div className="space-y-4">
                
                {potentialDuplicate && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <ArrowRightLeft className="text-amber-600 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-amber-800">تنبيه: اشتباه في تكرار دعوى</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                تم العثور على دعوى سابقة لنفس المدعي.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg border border-judicial-100 overflow-hidden">
                    <div className="bg-judicial-50 p-6 border-b border-judicial-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-judicial-900">نتيجة الفحص الآلي</h3>
                            <p className="text-xs text-judicial-600 mt-1">ID: {result.id}</p>
                        </div>
                        <div className="flex gap-2">
                             {result.analysis.priority === 'مستعجلة' && (
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1">
                                    <AlertOctagon size={12} /> مستعجلة
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                         {/* Requirements Validation Check */}
                        <div className={`p-4 rounded-xl border ${result.analysis.requirementsCheck.missingElements.length === 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                            <h4 className={`font-bold text-sm mb-2 flex items-center gap-2 ${result.analysis.requirementsCheck.missingElements.length === 0 ? 'text-green-800' : 'text-orange-800'}`}>
                                {result.analysis.requirementsCheck.missingElements.length === 0 
                                    ? <><CheckCircle2 size={16} /> صحيفة الدعوى مستوفية للشروط</> 
                                    : <><AlertCircle size={16} /> نواقص في صحيفة الدعوى</>
                                }
                            </h4>
                            {result.analysis.requirementsCheck.missingElements.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
                                    {result.analysis.requirementsCheck.missingElements.map((el, i) => (
                                        <li key={i}>غير واضح: {el}</li>
                                    ))}
                                    {!hasDocs && <li>تنبيه: لم يتم تأكيد إرفاق المستندات</li>}
                                    {!hasFees && <li>تنبيه: لم يتم تأكيد سداد الرسوم</li>}
                                </ul>
                            )}
                        </div>

                        {/* Court Type */}
                        <div className="flex items-center gap-4 bg-judicial-50/50 p-4 rounded-xl border border-judicial-100">
                            <div className="w-10 h-10 rounded-full bg-judicial-100 flex items-center justify-center text-judicial-700">
                                <Gavel size={20} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">التوجيه المقترح</label>
                                <div className="text-lg font-bold text-judicial-900">
                                    {result.analysis.courtType}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Details */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 font-bold block mb-1">سبب التوجيه</label>
                                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {result.analysis.reasoning}
                                </p>
                            </div>
                            {/* Extracted Data Visualization */}
                            {inputMethod === 'upload' && result.analysis.extractedInfo && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                    <h5 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
                                        <FileType size={12} />
                                        بيانات مستخرجة من الملف
                                    </h5>
                                    <div className="space-y-1 text-xs text-blue-900">
                                        <p><span className="font-bold">المدعي:</span> {result.analysis.extractedInfo.plaintiffName || '-'}</p>
                                        <p><span className="font-bold">الموضوع:</span> {result.analysis.extractedInfo.subject || '-'}</p>
                                        <p className="truncate"><span className="font-bold">الوقائع:</span> {result.analysis.extractedInfo.facts || '-'}</p>
                                    </div>
                                </div>
                            )}

                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold block mb-1">الكلمات المفتاحية</label>
                                    <div className="flex flex-wrap gap-1">
                                        {result.analysis.keywords.slice(0,3).map((k,i) => (
                                            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{k}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold block mb-1">الأسانيد المستنبطة</label>
                                    <p className="text-xs text-gray-600 truncate">{result.analysis.legalGrounds}</p>
                                </div>
                            </div>
                        </div>

                        {/* Malicious Check */}
                        {result.analysis.isLikelyMalicious && (
                             <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                                <FileWarning className="text-red-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-red-800 text-sm">احتمالية دعوى كيدية</h4>
                                    <p className="text-red-700 text-xs mt-1">{result.analysis.maliciousReason}</p>
                                </div>
                             </div>
                        )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 flex gap-3">
                        <button onClick={resetForm} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                            مسح
                        </button>
                        <button className="flex-1 bg-judicial-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-judicial-700 transition-colors shadow-md shadow-judicial-500/20">
                            اعتماد
                        </button>
                    </div>
                </div>
             </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
                    <Scale size={40} className="text-judicial-200" />
                </div>
                <h3 className="text-lg font-bold text-gray-400">
                    {inputMethod === 'upload' ? 'جاهز لتحليل الملفات' : 'بانتظار اكتمال النموذج'}
                </h3>
                <p className="text-gray-400 mt-2 text-sm max-w-xs leading-relaxed">
                    {inputMethod === 'upload' 
                        ? 'قم برفع صحيفة الدعوى (صورة أو PDF) ليقوم النظام بقراءتها وتعبئة الحقول آلياً.'
                        : 'قم بتعبئة حقول صحيفة الدعوى بعناية لضمان دقة الفرز الآلي وقبول الدعوى شكلاً.'
                    }
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NewCase;