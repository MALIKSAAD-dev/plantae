// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const registerUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Login error:", error.code, error.message);
    
    // Customize error messages for better user experience
    if (error.code === 'auth/user-not-found') {
      throw new Error('Account not found. Please sign up first before trying to login.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format. Please check your email address.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    }
    
    // Pass through the original error
    throw error;
  }
};

// Google authentication
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google sign-in error:", error.code, error.message);
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
    }
    
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Function to listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Chat Firestore Functions
export const createUserChat = async (userId: string, title: string = 'New Chat') => {
  const chatsCollection = collection(firestore, `chats/${userId}/userChats`);
  
  const timestamp = Date.now();
  const chatData = {
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: []
  };
  
  const docRef = await addDoc(chatsCollection, chatData);
  const chat = {
    id: docRef.id,
    ...chatData
  };
  
  // Update the document with its ID
  await updateDoc(docRef, { id: docRef.id });
  
  return chat;
};

export const getUserChats = async (userId: string) => {
  const chatsCollection = collection(firestore, `chats/${userId}/userChats`);
  const q = query(chatsCollection, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => doc.data());
};

export const getUserChatById = async (userId: string, chatId: string) => {
  const chatRef = doc(firestore, `chats/${userId}/userChats/${chatId}`);
  const snapshot = await getDoc(chatRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data();
};

export const addMessageToUserChat = async (userId: string, chatId: string, role: 'user' | 'assistant', content: string) => {
  const chatRef = doc(firestore, `chats/${userId}/userChats/${chatId}`);
  const chatSnapshot = await getDoc(chatRef);
  
  if (!chatSnapshot.exists()) {
    throw new Error('Chat not found');
  }
  
  const chat = chatSnapshot.data();
  
  // Ensure messages is an array (even if it wasn't before)
  const messages = Array.isArray(chat.messages) ? [...chat.messages] : [];
  
  // Create new message with all required fields
  const newMessage = {
    id: Date.now().toString(),
    role: role,
    content: content || '',
    timestamp: Date.now(),
    isTyping: false
  };
  
  // Add message to array
  messages.push(newMessage);
  
  // Debug
  console.log(`Adding message to chat ${chatId}:`, newMessage);
  console.log(`Messages array now has ${messages.length} messages`);
  
  // Update chat title based on first user message if it's "New Chat"
  let title = chat.title || 'New Chat';
  if (title === 'New Chat' && role === 'user' && messages.filter(m => m.role === 'user').length === 1) {
    // Use first ~20 characters of first user message as title
    title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
  }
  
  // Create update object with all required fields
  const updates = {
    messages: messages,
    title: title,
    updatedAt: Date.now(),
    id: chatId, // Ensure ID is always present
    createdAt: chat.createdAt || Date.now() // Ensure createdAt is always present
  };
  
  // Update the document with the new data
  await updateDoc(chatRef, updates);
  
  // Return updated chat data
  return {
    ...chat,
    ...updates
  };
};

export const deleteUserChat = async (userId: string, chatId: string) => {
  const chatRef = doc(firestore, `chats/${userId}/userChats/${chatId}`);
  await deleteDoc(chatRef);
};

export { auth, firestore }; 