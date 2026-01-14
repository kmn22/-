import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, CourtType, CasePriority } from "../types";

const apiKey = process.env.API_KEY;

// Define the response schema for strict JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    courtType: {
      type: Type.STRING,
      enum: [
        'المحكمة التجارية',
        'المحكمة العمالية',
        'محكمة الأحوال الشخصية',
        'المحكمة العامة',
        'المحكمة الجزائية',
        'المحكمة الإدارية',
        'محكمة التنفيذ',
        'غير مصنف'
      ],
      description: "The specific court that has jurisdiction over this case."
    },
    priority: {
      type: Type.STRING,
      enum: ['عادية', 'متوسطة', 'مستعجلة'],
      description: "The urgency level of the case. 'مستعجلة' if immediate action is needed or keywords suggest urgency."
    },
    summary: {
      type: Type.STRING,
      description: "A concise summary of the case description in Arabic (max 20 words)."
    },
    reasoning: {
      type: Type.STRING,
      description: "Why this court and priority were chosen."
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key legal terms extracted from the text."
    },
    isLikelyMalicious: {
      type: Type.BOOLEAN,
      description: "True if the case seems frivolous, vexatious, or lacks clear legal grounds."
    },
    maliciousReason: {
      type: Type.STRING,
      description: "If malicious, explain why. Otherwise empty."
    },
    legalGrounds: {
      type: Type.STRING,
      description: "Extract the legal grounds or contract clauses mentioned, if any. If none, state 'غير مذكور'."
    },
    requirementsCheck: {
      type: Type.OBJECT,
      properties: {
        hasClearFacts: { type: Type.BOOLEAN, description: "True if the incident/facts are described clearly." },
        hasClearRequest: { type: Type.BOOLEAN, description: "True if the plaintiff clearly states what they want (compensation, divorce, etc)." },
        missingElements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of missing elements: 'الوقائع', 'الطلبات', or 'الأسانيد'." }
      },
      required: ["hasClearFacts", "hasClearRequest", "missingElements"]
    },
    extractedInfo: {
      type: Type.OBJECT,
      description: "Extract specific details from the text/file to populate a lawsuit form.",
      properties: {
        plaintiffName: { type: Type.STRING, description: "Name of the plaintiff (المدعي)." },
        plaintiffId: { type: Type.STRING, description: "ID number of plaintiff if available." },
        defendantName: { type: Type.STRING, description: "Name of the defendant (المدعى عليه)." },
        subject: { type: Type.STRING, description: "Short subject/title of the lawsuit." },
        facts: { type: Type.STRING, description: "The section describing the facts/events." },
        requests: { type: Type.STRING, description: "The section describing the requests." },
        legalBasis: { type: Type.STRING, description: "The section describing legal basis." }
      }
    }
  },
  required: ["courtType", "priority", "summary", "reasoning", "keywords", "isLikelyMalicious", "legalGrounds", "requirementsCheck"]
};

interface AnalyzeInput {
  text?: string;
  media?: {
    data: string;
    mimeType: string;
  }
}

export const analyzeCaseDescription = async (input: string | AnalyzeInput): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    أنت خبير قانوني في النظام القضائي السعودي. 
    مهمتك:
    1. قراءة صحيفة الدعوى (نص أو ملف صورة/PDF).
    2. استخراج البيانات الأساسية (المدعي، المدعى عليه، الوقائع، الطلبات، الأسانيد).
    3. تصنيف الدعوى وتحديد المحكمة المختصة (تجارية، عمالية، أحوال، عامة، جزائية، إدارية، تنفيذ).
    4. التحقق من استيفاء متطلبات القبول (وضوح الوقائع والطلبات والأسانيد).
    
    إذا كان المدخل ملفاً، قم باستخراج النصوص منه بدقة ثم حللها.
  `;

  // Prepare contents
  let contents: any[] = [];
  
  if (typeof input === 'string') {
    contents = [{ text: input }];
  } else {
    if (input.media) {
      contents.push({
        inlineData: {
          mimeType: input.media.mimeType,
          data: input.media.data
        }
      });
    }
    if (input.text) {
      contents.push({ text: input.text });
    }
    // If no text provided with media, add a prompt
    if (input.media && !input.text) {
        contents.push({ text: "قم بتحليل هذا المستند واستخراج بيانات الدعوى وتصنيفها." });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: contents },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("No response text received from model.");
    }
  } catch (error) {
    console.error("Error analyzing case:", error);
    throw error;
  }
};