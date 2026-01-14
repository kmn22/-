export enum CasePriority {
  LOW = 'عادية',
  MEDIUM = 'متوسطة',
  HIGH = 'مستعجلة',
}

export enum CourtType {
  COMMERCIAL = 'المحكمة التجارية',
  LABOR = 'المحكمة العمالية',
  PERSONAL_STATUS = 'محكمة الأحوال الشخصية',
  GENERAL = 'المحكمة العامة',
  CRIMINAL = 'المحكمة الجزائية',
  ADMINISTRATIVE = 'المحكمة الإدارية',
  EXECUTION = 'محكمة التنفيذ',
  UNKNOWN = 'غير مصنف',
}

export interface ExtractedCaseInfo {
  plaintiffName?: string;
  plaintiffId?: string;
  defendantName?: string;
  subject?: string;
  facts?: string;
  requests?: string;
  legalBasis?: string;
}

export interface AnalysisResult {
  courtType: CourtType;
  priority: CasePriority;
  summary: string;
  reasoning: string;
  keywords: string[];
  isLikelyMalicious: boolean;
  maliciousReason?: string;
  legalGrounds: string; // الأسانيد القانونية المستنبطة
  requirementsCheck: {
    hasClearFacts: boolean;
    hasClearRequest: boolean;
    missingElements: string[]; // "Requests", "Facts", etc.
  };
  extractedInfo?: ExtractedCaseInfo; // Data extracted from file upload
}

export interface CaseSubmission {
  id: string;
  plaintiffName: string;
  plaintiffId?: string; // رقم الهوية/السجل
  defendantName: string;
  description: string; // موضوع الدعوى
  facts?: string; // الوقائع
  requests?: string; // الطلبات
  legalBasis?: string; // الأسانيد
  date: string;
  status: 'pending' | 'analyzed' | 'routed';
  analysis?: AnalysisResult;
}

export interface DashboardStats {
  totalCases: number;
  urgentCases: number;
  routedCases: number;
  flaggedCases: number;
}