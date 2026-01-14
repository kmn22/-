import streamlit as st
import google.generativeai as genai
import plotly.express as px
import pandas as pd
import os

# 1. إعداد الصفحة وتصميمها
st.set_page_config(
    page_title="المُصنّف القضائي الآلي",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# تفعيل دعم اللغة العربية وتنسيق الواجهة (CSS)
st.markdown("""
<style>
    .main {direction: rtl;}
    .stTextInput, .stTextArea, .stSelectbox {text-align: right;}
    div[data-testid="stMetricValue"] {font-size: 24px; color: #0ea5e9;}
    h1, h2, h3 {font-family: 'Tajawal', sans-serif;}
</style>
""", unsafe_allow_html=True)

# 2. الإعدادات والاتصال
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    try:
        api_key = st.secrets["GOOGLE_API_KEY"]
    except:
        st.warning("⚠️ الرجاء وضع مفتاح API")
        st.stop()

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

# 3. القائمة الجانبية (Sidebar)
with st.sidebar:
    st.image("https://via.placeholder.com/50/0ea5e9/FFFFFF?text=⚖️", width=50) # يمكنك وضع شعار هنا
    st.title("المصنف القضائي")
    st.info("نظام الفرز الذكي")
    
    selected_page = st.radio(
        "القائمة الرئيسية",
        ["لوحة المعلومات", "قيد دعوى جديدة", "سجل القضايا"],
        index=1 
    )
    
    st.markdown("---")
    st.caption("حالة النظام: 🟢 متصل بالذكاء الاصطناعي")

# 4. صفحة لوحة المعلومات (Dashboard)
if selected_page == "لوحة المعلومات":
    st.title("📊 لوحة المعلومات")
    st.markdown("نظرة عامة على أداء نظام الفرز والتوجيه القضائي")
    
    # بطاقات الإحصائيات (Metrics)
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("إجمالي القضايا", "3", "+1")
    col2.metric("قضايا مستعجلة", "2", "66%", delta_color="inverse")
    col3.metric("تم الفرز آلياً", "3", "100%")
    col4.metric("متوسط زمن الفرز", "1.2 ث", "-0.3s")
    
    # الرسم البياني
    st.markdown("---")
    st.subheader("توزيع القضايا حسب المحكمة")
    
    # بيانات وهمية للعرض
    data = pd.DataFrame({
        'المحكمة': ['تجارية', 'أحوال شخصية', 'عمالية', 'أخرى'],
        'العدد': [15, 30, 10, 5]
    })
    
    fig = px.pie(data, values='العدد', names='المحكمة', hole=0.5, color_discrete_sequence=px.colors.sequential.Blues)
    st.plotly_chart(fig, use_container_width=True)

# 5. صفحة قيد دعوى جديدة (Main App)
elif selected_page == "قيد دعوى جديدة":
    st.title("📝 قيد دعوى جديدة")
    st.markdown("قم بإدخال تفاصيل الدعوى ليقوم النظام بتحليلها وتوجيهها آلياً.")
    
    with st.container():
        # تقسيم الشاشة لجزئين: يمين (إدخال) ويسار (نتائج)
        col_input, col_result = st.columns([1.2, 1])
        
        with col_input:
            with st.form("case_form"):
                st.subheader("بيانات الدعوى")
                plaintiff = st.text_input("اسم المدعي")
                subject = st.text_input("موضوع الدعوى (مثال: فسخ عقد، مطالبة مالية)")
                details = st.text_area("الوقائع والتفاصيل", height=200, placeholder="اشرح تفاصيل الدعوى هنا...")
                
                submitted = st.form_submit_button("🔍 تحليل وتصنيف الدعوى", type="primary")
        
        with col_result:
            if submitted and details:
                with st.spinner('جارٍ استشارة المساعد الذكي...'):
                    try:
                        prompt = f"""
                        حلل النص التالي قانونياً حسب النظام السعودي:
                        الموضوع: {subject}
                        التفاصيل: {details}
                        
                        اعرض النتيجة بتنسيق Markdown منظم جداً يحتوي على:
                        1. **المحكمة المختصة**: (بخط كبير)
                        2. **نسبة الاختصاص**: (رقم تقديري)
                        3. **درجة الاستعجال**: (عادية/مستعجلة)
                        4. **الأسانيد النظامية**: (المواد المحتملة)
                        5. **التوصية**: هل تقبل شكلاً أم لا؟
                        """
                        response = model.generate_content(prompt)
                        
                        st.success("تم التحليل بنجاح!")
                        
                        # عرض النتيجة في بطاقة جميلة
                        st.markdown(f"""
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 10px; border: 1px solid #bae6fd;">
                            {response.text}
                        </div>
                        """, unsafe_allow_html=True)
                        
                    except Exception as e:
                        st.error("حدث خطأ في الاتصال.")
            elif submitted and not details:
                st.warning("الرجاء إدخال التفاصيل.")
            else:
                st.info("👈 بانتظار إدخال البيانات للتحليل")
                st.image("https://cdn-icons-png.flaticon.com/512/2643/2643509.png", width=100)

# 6. صفحة السجل (History)
elif selected_page == "سجل القضايا":
    st.title("🗂️ سجل القضايا السابقة")
    # جدول وهمي للعرض
    df = pd.DataFrame({
        "رقم الدعوى": ["101", "102", "103"],
        "المدعي": ["شركة البناء", "سارة أحمد", "خالد علي"],
        "المحكمة": ["تجارية", "أحوال شخصية", "عمالية"],
        "الحالة": ["مكتملة", "مكتملة", "تحت المراجعة"]
    })
    st.table(df)
