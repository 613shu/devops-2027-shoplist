# שימוש ב-image בסיס רשמי של Python בגרסה מדויקת וקבועה, בגרסת slim קטנה
FROM python:3.12.7-slim

# מונע מ-Python ליצור קבצי pyc. מיותרים בתוך הקונטיינר
ENV PYTHONDONTWRITEBYTECODE=1

# גורם ללוגים להופיע מיד, בלי השהיה של buffer
ENV PYTHONUNBUFFERED=1

# ערך ברירת מחדל לברכה, שאפשר לדרוס בזמן ההרצה עם -e
ENV GREETING=Hello

# קביעת תיקיית העבודה בתוך הקונטיינר; כל הפקודות הבאות ירוצו ממנה
WORKDIR /app

# העתקת קובץ התלויות בלבד, לפני הקוד, כדי שה-cache של השכבה הבאה יישמר כל עוד התלויות לא השתנו
COPY requirements.txt .

# התקנת התלויות בלי לשמור cache של pip, כדי להקטין את ה-image
RUN pip install --no-cache-dir -r requirements.txt

# העתקת קוד השירות אחרי התקנת התלויות, כך ששינוי בקוד לא יגרום להתקנה מחדש
COPY app.py .

# יצירת משתמש רגיל (לא root) להרצת השירות, מטעמי אבטחה
RUN useradd --create-home appuser

# מעבר למשתמש הרגיל לצורך הרצת השירות
USER appuser

# תיעוד הפורט שהשירות מאזין לו (8000, כפי שמוגדר ב-app.run)
EXPOSE 8000

# הפקודה שמריצה את השירות, בצורת exec עם סוגריים מרובעים
CMD ["python", "app.py"]
