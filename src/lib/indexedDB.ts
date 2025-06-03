// IndexedDB utility for chat history management

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'plantae';
const DB_VERSION = 1;
const CHATS_STORE = 'chats';

// Database connection
let dbPromise: Promise<IDBDatabase> | null = null;

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      console.log('Opening IndexedDB...');
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('IndexedDB opened successfully');
        resolve(request.result);
      };

      request.onupgradeneeded = (_event) => {
        console.log('Upgrading IndexedDB schema...');
        const db = request.result;
        
        // Create chats object store
        if (!db.objectStoreNames.contains(CHATS_STORE)) {
          console.log('Creating chats store');
          const store = db.createObjectStore(CHATS_STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          console.log('Chats store created');
        }
      };
    });
  }
  return dbPromise;
};

// Get all chats
export const getAllChats = async (): Promise<Chat[]> => {
  try {
    console.log('Getting all chats...');
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(CHATS_STORE, 'readonly');
        transaction.onerror = (_event) => {
          console.error('Transaction error:', transaction.error);
          reject(transaction.error);
        };
        
        const store = transaction.objectStore(CHATS_STORE);
        const index = store.index('updatedAt');
        const request = index.openCursor(null, 'prev'); // Get in descending order by updatedAt
        
        const chats: Chat[] = [];
        
        request.onsuccess = (_event) => {
          const cursor = request.result;
          if (cursor) {
            console.log('Found chat:', cursor.value.id, cursor.value.title);
            chats.push(cursor.value);
            cursor.continue();
          } else {
            console.log(`Retrieved ${chats.length} chats`);
            resolve(chats);
          }
        };
        
        request.onerror = () => {
          console.error('Cursor error:', request.error);
          reject(request.error);
        };
      } catch (e) {
        console.error('Error in getAllChats:', e);
        reject(e);
      }
    });
  } catch (e) {
    console.error('Outer error in getAllChats:', e);
    return [];
  }
};

// Get a specific chat by ID
export const getChatById = async (id: string): Promise<Chat | null> => {
  try {
    console.log('Getting chat by ID:', id);
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(CHATS_STORE, 'readonly');
        const store = transaction.objectStore(CHATS_STORE);
        const request = store.get(id);
        
        request.onsuccess = () => {
          if (request.result) {
            console.log('Found chat:', request.result.id, request.result.title);
          } else {
            console.log('Chat not found:', id);
          }
          resolve(request.result || null);
        };
        
        request.onerror = () => {
          console.error('Error getting chat:', request.error);
          reject(request.error);
        };
      } catch (e) {
        console.error('Error in getChatById:', e);
        reject(e);
      }
    });
  } catch (e) {
    console.error('Outer error in getChatById:', e);
    return null;
  }
};

// Create a new chat
export const createChat = async (title: string = 'New Plant Chat'): Promise<Chat> => {
  try {
    console.log('Creating new chat:', title);
    const db = await initDB();
    const now = Date.now();
    
    const newChat: Chat = {
      id: `chat_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now
    };
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(CHATS_STORE, 'readwrite');
        const store = transaction.objectStore(CHATS_STORE);
        const request = store.add(newChat);
        
        request.onsuccess = () => {
          console.log('Chat created successfully:', newChat.id);
          resolve(newChat);
        };
        
        request.onerror = () => {
          console.error('Error creating chat:', request.error);
          reject(request.error);
        };
      } catch (e) {
        console.error('Error in createChat:', e);
        reject(e);
      }
    });
  } catch (e) {
    console.error('Outer error in createChat:', e);
    throw e;
  }
};

// Update a chat
export const updateChat = async (chat: Chat): Promise<Chat> => {
  try {
    console.log('Updating chat:', chat.id);
    const db = await initDB();
    
    // Update the timestamp
    chat.updatedAt = Date.now();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(CHATS_STORE, 'readwrite');
        const store = transaction.objectStore(CHATS_STORE);
        const request = store.put(chat);
        
        request.onsuccess = () => {
          console.log('Chat updated successfully:', chat.id);
          resolve(chat);
        };
        
        request.onerror = () => {
          console.error('Error updating chat:', request.error);
          reject(request.error);
        };
      } catch (e) {
        console.error('Error in updateChat:', e);
        reject(e);
      }
    });
  } catch (e) {
    console.error('Outer error in updateChat:', e);
    throw e;
  }
};

// Delete a chat
export const deleteChat = async (id: string): Promise<void> => {
  try {
    console.log('Deleting chat:', id);
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(CHATS_STORE, 'readwrite');
        const store = transaction.objectStore(CHATS_STORE);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('Chat deleted successfully:', id);
          resolve();
        };
        
        request.onerror = () => {
          console.error('Error deleting chat:', request.error);
          reject(request.error);
        };
      } catch (e) {
        console.error('Error in deleteChat:', e);
        reject(e);
      }
    });
  } catch (e) {
    console.error('Outer error in deleteChat:', e);
    throw e;
  }
};

// Add a message to a chat
export const addMessageToChat = async (
  chatId: string, 
  role: 'user' | 'assistant', 
  content: string
): Promise<Chat> => {
  try {
    console.log('Adding message to chat:', chatId, role);
    const chat = await getChatById(chatId);
    
    if (!chat) {
      console.error(`Chat with ID ${chatId} not found`);
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now()
    };
    
    chat.messages.push(newMessage);
    
    // Update title based on first user message if this is the first message
    if (chat.messages.length === 1 && role === 'user') {
      chat.title = content.length > 30 ? `${content.substring(0, 30)}...` : content;
      console.log('Updated chat title:', chat.title);
    }
    
    return updateChat(chat);
  } catch (e) {
    console.error('Error in addMessageToChat:', e);
    throw e;
  }
}; 