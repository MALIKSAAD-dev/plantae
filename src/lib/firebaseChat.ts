import { 
  createUserChat, 
  getUserChats, 
  getUserChatById,
  addMessageToUserChat,
  deleteUserChat
} from './firebase';
import { auth } from './firebase';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isTyping?: boolean; // Optional property to indicate if message is being typed
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

// Function to create a new chat
export const createChat = async (title = 'New Chat'): Promise<Chat> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to create a chat');
  }
  
  return await createUserChat(user.uid, title);
};

// Function to get all chats for the current user
export const getAllChats = async (): Promise<Chat[]> => {
  const user = auth.currentUser;
  
  if (!user) {
    console.log("getAllChats: No user logged in, returning empty array");
    return getAnonymousChats(); // Return anonymous chats for non-authenticated users
  }
  
  try {
    console.log(`getAllChats: Fetching chats for user ${user.uid}`);
    const chats = await getUserChats(user.uid);
    console.log(`getAllChats: Found ${chats.length} chats`);
    
    // Verify that messages array is properly set for each chat
    const validatedChats: Chat[] = chats.map(chat => {
      if (!chat.messages || !Array.isArray(chat.messages)) {
        console.log(`Fixing chat ${chat.id} with missing/invalid messages array`);
        return {
          ...chat,
          id: chat.id || '',
          title: chat.title || '',
          createdAt: chat.createdAt || Date.now(),
          updatedAt: chat.updatedAt || Date.now(),
          messages: [] // Ensure messages is a valid array
        };
      }
      return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: Array.isArray(chat.messages) ? chat.messages : []
      } as Chat;
    });
    
    return validatedChats;
  } catch (error) {
    console.error("Error in getAllChats:", error);
    return []; // Return empty array on error
  }
};

// Function to get a specific chat by ID
export const getChatById = async (chatId: string): Promise<Chat | null> => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  const chat = await getUserChatById(user.uid, chatId);
  if (!chat) return null;

  // Ensure chat has all required fields
  return {
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    messages: Array.isArray(chat.messages) ? chat.messages : []
  };
};

// Function to add a message to a chat
export const addMessageToChat = async (
  chatId: string,
  message: Message
): Promise<Chat> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to add messages');
  }
  
  try {
    // First check if the chat exists to provide a clearer error
    const chatExists = await getUserChatById(user.uid, chatId);
    if (!chatExists) {
      throw new Error('Chat not found');
    }
    
    // Ensure message has all required fields
    const validMessage = {
      id: message.id || Date.now().toString(),
      role: message.role,
      content: message.content || '',
      timestamp: message.timestamp || Date.now(),
      isTyping: message.isTyping || false
    };
    
    // If chat exists, proceed with adding the message
    const chat = await addMessageToUserChat(user.uid, chatId, validMessage.role, validMessage.content);
    if (!chat) throw new Error('Failed to add message to chat');
    
    // Make sure all required properties are included
    return {
      id: chatId,
      title: chat.title || '',
      createdAt: chat.createdAt || Date.now(),
      updatedAt: chat.updatedAt || Date.now(),
      messages: Array.isArray(chat.messages) ? chat.messages : []
    };
  } catch (error) {
    console.error(`Error adding message to chat ${chatId}:`, error);
    // Re-throw the error with appropriate context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to add message to chat');
    }
  }
};

// Function to delete a chat
export const deleteChat = async (chatId: string): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to delete chats');
  }
  
  await deleteUserChat(user.uid, chatId);
};

// This handles anonymous usage before login
// For non-authenticated users, we'll continue to use the anonymous chat in-memory
const anonymousChats: Chat[] = [];

// Helper to generate anonymous chat ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Anonymous chat functions (used when user is not authenticated)
export const createAnonymousChat = (title = 'New Chat'): Chat => {
  const timestamp = Date.now();
  const newChat: Chat = {
    id: generateId(),
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: []
  };
  
  anonymousChats.unshift(newChat);
  return newChat;
};

export const getAnonymousChats = (): Chat[] => {
  return [...anonymousChats];
};

export const getAnonymousChatById = (chatId: string): Chat | null => {
  return anonymousChats.find(chat => chat.id === chatId) || null;
};

export const addMessageToAnonymousChat = (
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Chat => {
  const chatIndex = anonymousChats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex === -1) {
    throw new Error('Chat not found');
  }
  
  const chat = anonymousChats[chatIndex];
  const newMessage: Message = {
    id: generateId(),
    role,
    content,
    timestamp: Date.now()
  };
  
  let title = chat.title;
  if (title === 'New Chat' && role === 'user' && chat.messages.filter(m => m.role === 'user').length === 0) {
    title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
  }
  
  const updatedChat: Chat = {
    ...chat,
    title,
    messages: [...chat.messages, newMessage],
    updatedAt: Date.now()
  };
  
  // Update chat in the list
  anonymousChats[chatIndex] = updatedChat;
  
  // Re-sort based on updated timestamp
  anonymousChats.sort((a, b) => b.updatedAt - a.updatedAt);
  
  return updatedChat;
};

export const deleteAnonymousChat = (chatId: string): void => {
  const chatIndex = anonymousChats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex !== -1) {
    anonymousChats.splice(chatIndex, 1);
  }
}; 