# image בסיס: Python 3.11 בגרסה קטנה
FROM python:3.11-slim

# תיקיית העבודה בתוך ה-container
WORKDIR /app

# קודם רק רשימת התלויות, כדי שההתקנה תישמר ב-cache
COPY requirements.txt .

# התקנת התלויות (הדגלים --trusted-host עוקפים את בעיית ה-SSL של נטפרי)
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

# רק עכשיו הקוד: שינוי בקוד לא יגרום להתקנה מחדש
COPY app.py .

# תיעוד בלבד: השרת מאזין בפורט 5000
EXPOSE 5000

# הפקודה שרצה כשה-container עולה, בצורת exec
CMD ["python", "app.py"]
