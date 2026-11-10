# image בסיס: Node.js 24 בגרסת alpine הקטנה
FROM node:24-alpine

# תיקיית העבודה בתוך ה-container
WORKDIR /app

# העתקת הקבצים. אין npm install: ל-stats אין חבילות חיצוניות
COPY package.json .
COPY server.js .

# תיעוד בלבד: השרת מאזין בפורט 3000
EXPOSE 3000

# הפקודה שרצה כשה-container עולה, בצורת exec
CMD ["node", "server.js"]
