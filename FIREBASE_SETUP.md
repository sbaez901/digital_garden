# 🔥 Firebase Authentication Setup

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "task-garden")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click "Email/Password" under "Sign-in method"
4. Enable "Email/Password" and click "Save"

## Step 3: Get Your Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "Task Garden Web")
6. Copy the config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 4: Update Your Code

1. Open `src/firebase.ts`
2. Replace the placeholder config with your actual Firebase config
3. Save the file

## Step 5: Test It!

1. Run `npm run dev`
2. Click "Sign in or create account"
3. Create a new account or sign in
4. Your tasks will now be associated with your account!

## 🎯 What You Get

- **User Authentication**: Sign up, sign in, sign out
- **User Profiles**: See who's logged in
- **Secure Access**: Only authenticated users can access the app
- **Professional Feel**: Makes your app feel like a real product

## 🚀 Next Steps

Once authentication is working, you can:
- Add user-specific task storage
- Implement data persistence
- Add user preferences
- Create user profiles

## 🔒 Security Notes

- Firebase handles all the security for you
- Passwords are encrypted and secure
- No sensitive data is stored in your code
- Users can only access their own data

## 🆘 Need Help?

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Make sure your config values are correct
- Check the browser console for error messages
