# Firestore Setup Guide

This guide will help you set up Firebase Firestore for the chat feature in the Plantae application.

## Creating a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Plantae")
4. Accept the Firebase terms
5. Choose whether to enable Google Analytics (recommended)
6. Click "Create project"

## Setting Up Authentication

1. In the Firebase Console, select your project
2. Go to "Authentication" from the left sidebar
3. Click "Get started"
4. Select "Email/Password" as the sign-in method
5. Enable "Email/Password"
6. Click "Save"

## Setting Up Firestore Database

1. In the Firebase Console, select your project
2. Go to "Firestore Database" from the left sidebar
3. Click "Create database"
4. Select your database location (choose the closest region to your users)
5. Start in test mode (we'll update the rules later)
6. Click "Enable"

## Firestore Security Rules

For development and testing, you can use the following rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{userId}/userChats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

To set these rules:

1. In the Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Paste the rules above
4. Click "Publish"

## Collection Structure

The chat data in Firestore follows this structure:

```
/chats
  /{userId}
    /userChats
      /{chatId}
        id: string
        title: string
        createdAt: number
        updatedAt: number
        messages: [
          {
            id: string
            role: "user" | "assistant" 
            content: string
            timestamp: number
          }
        ]
```

## Adding Firebase to Your Web App

1. In the Firebase Console, select your project
2. Click on the web icon (</>) to add a web app
3. Register your app with a nickname (e.g., "Plantae Web")
4. Click "Register app"
5. Copy the Firebase configuration object

## Setting Up Environment Variables

Create a `.env` file in the root of your project with the following variables (replace with your actual values):

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Your Firebase Firestore setup is now complete and ready to use with the Plantae application!

## Monitoring and Debugging

- You can view all chats in the Firebase console under "Firestore Database"
- Check authentication logs under "Authentication" > "Users"
- For debugging, use the "Firestore usage" tab to monitor reads/writes

## Data Migration

When a user who previously used the app anonymously signs up or logs in:

1. The app automatically migrates any anonymous chats to their Firestore account
2. Their usage limits are reset
3. All future chats will be saved to Firestore

## Security Considerations

The current setup includes security rules that:
- Allow users to only read and write their own data
- Require authentication for all database operations

For production environments, consider further hardening:
- Add rate limiting
- Implement data validation on server side
- Set up regular backups of your Firestore data 