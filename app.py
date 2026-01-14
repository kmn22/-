import streamlit as st
import google.generativeai as genai

# 1. إعداد الصفحة
st.set_page_config(page_title="المُصنّف القضائي", layout="centered", page_icon="⚖️")

# 2. إعداد مفتاح API بشكل آمن
try:
    genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])
except:
    st.error("لم يتم العثور على مفتاح API. يرجى إضافته في إعدادات Secrets.")

# 3. إعدادات الموديل (هنا تضع الإعدادات التي نسختها من Get Code)
generation_config = {
  "temperature": 0.4, # يمكنك تعديلها حسب تجربتك في الاستوديو
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
}

# إعدادات الأمان (اختياري، يمكن تركها افتراضية)
safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  # ... بقية الإعدادات
]

# تعريف الموديل
model = genai.GenerativeModel(
  model_name="gemini-1.5-flash",
  generation_config=generation_config,
  # safety_settings=safety_settings # فعل هذا السطر إذا نسخت إعدادات الأمان
)

# 4. واجهة المستخدم
st.title("⚖️ المُصنّف الآلي للدعاوى")
st.caption("نظام ذكي لفرز الدعاوى وتوجيهها للمحكمة المختصة فوراً")

lawsuit_text = st.text_area("أدخل نص صحيفة الدعوى:", height=150)

if st.button("تحليل وتصنيف"):
    if not lawsuit_text:
        st.warning("الرجاء إدخال النص.")
    else:
        with st.spinner('جارٍ استشارة الذكاء الاصطناعي...'):
            try:
                # هذا هو الـ Prompt الهيكلي الذي صممته
                # نصيحة: انسخ الـ System Instructions من الاستوديو وضعها هنا
                prompt = f"""
                قم بتحليل النص التالي وتصنيفه قانونياً حسب النظام السعودي.
                النص: {lawsuit_text}
                
                المخرجات المطلوبة:
                - نوع الدعوى:
                - المحكمة المختصة:
                - درجة الاستعجال (عادية/مستعجلة):
                - المبرر:
                """
                
                response = model.generate_content(prompt)
                st.markdown("### النتيجة:")
                st.write(response.text)
                
            except Exception as e:
                st.error(f"حدث خطأ: {e}")
