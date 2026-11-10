# image בסיס: Nginx מוכן, בגרסת alpine הקטנה
FROM nginx:1.30-alpine

# קובצי האתר לתיקייה ש-Nginx מגיש ממנה
COPY index.html  /usr/share/nginx/html/
COPY app.js      /usr/share/nginx/html/
COPY style.css   /usr/share/nginx/html/

# ההגדרות שלנו במקום הגדרות ברירת המחדל של Nginx
COPY nginx.conf  /etc/nginx/conf.d/default.conf

# תיעוד בלבד: Nginx מאזין בפורט 80
EXPOSE 80

# אין CMD: יורשים אותו מה-image של nginx
