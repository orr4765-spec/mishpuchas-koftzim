# חיבור Firebase – טבלאות משותפות לכל המשפחה (כ-5 דקות)

1. נכנסים ל-https://console.firebase.google.com עם חשבון הגוגל.
2. **Create a project** → שם: `mishpuchas` → אפשר לכבות Google Analytics → **Create**.
3. בתפריט הצד: **Build → Firestore Database → Create database**
   - Location: `eur3 (europe-west)`
   - לבחור **Start in production mode** → **Create**.
4. בלשונית **Rules** של Firestore, מוחקים הכול, מדביקים את הכללים שלמטה ולוחצים **Publish**.
5. חוזרים לדף הבית של הפרויקט (⚙️ → **Project settings**) → למטה ב-**Your apps** לוחצים על האייקון `</>` (Web)
   - שם: `game` → **Register app**
   - מעתיקים את האובייקט `firebaseConfig` שמופיע (apiKey, authDomain, projectId...).
6. שולחים לClaude את ה-firebaseConfig (או מדביקים אותו בעצמכם ב-`src/firebase-config.js`).

> ה-apiKey של Firebase לאתרים הוא ציבורי מטבעו – זה בסדר שהוא בקוד. מה שמגן על הנתונים הם הכללים.

## כללי האבטחה (Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /boards/{board}/entries/{player} {
      allow read: if true;
      allow create, update: if
        request.resource.data.keys().hasOnly(['name', 'score', 'char', 'emote', 'level', 'ts'])
        && request.resource.data.score is int
        && request.resource.data.score >= 0
        && request.resource.data.score < 3000
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 14
        && (resource == null || request.resource.data.score >= resource.data.score);
      allow delete: if false;
    }
  }
}
```

מה הכללים עושים: כל אחד יכול לקרוא את הטבלאות, ולכתוב רק תוצאה במבנה הנכון. אי אפשר להוריד תוצאה של מישהו אחר ואי אפשר למחוק.
