# Firebase Realtime Database Setup Guide

This guide will help you set up Firebase Realtime Database for the chat feature in the Plantae application.

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

## Setting Up Realtime Database

1. In the Firebase Console, select your project
2. Go to "Realtime Database" from the left sidebar
3. Click "Create database"
4. Select your database location (choose the closest region to your users)
5. Start in test mode (we'll update the rules later)
6. Click "Enable"

## Database Security Rules

For development and testing, you can use the following rules:

```
{
  "rules": {
    "chats": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "userChats": {
          "$chatId": {
            ".read": "$uid === auth.uid",
            ".write": "$uid === auth.uid",
            "messages": {
              "$messageId": {
                ".read": "$uid === auth.uid",
                ".write": "$uid === auth.uid"
              }
            }
          }
        }
      }
    }
  }
}
```

To set these rules:

1. In the Firebase Console, go to "Realtime Database"
2. Click on the "Rules" tab
3. Paste the rules above
4. Click "Publish"

## Database Structure

The chat data in the Realtime Database follows this structure:

```
/chats
  /$uid (user ID)
    /userChats
      /$chatId
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
VITE_FIREBASE_DATABASE_URL=your-database-url
```

Your Firebase setup is now complete and ready to use with the Plantae application! 