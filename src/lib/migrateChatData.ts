import { getAnonymousChats, createChat, addMessageToChat } from './firebaseChat';
import { auth } from './firebase';

/**
 * Migrates anonymous chats to Firestore for a newly registered user
 * This is useful when a user has been using the application anonymously
 * and then decides to sign up, preserving their chat history
 */
export const migrateAnonymousChatsToFirestore = async (): Promise<void> => {
  if (!auth.currentUser) {
    console.error('No authenticated user found');
    return;
  }
  
  try {
    // Get all anonymous chats
    const anonymousChats = getAnonymousChats();
    
    if (anonymousChats.length === 0) {
      console.log('No anonymous chats to migrate');
      return;
    }
    
    console.log(`Migrating ${anonymousChats.length} chats to Firestore...`);
    
    // For each anonymous chat, create a corresponding Firestore chat
    for (const anonymousChat of anonymousChats) {
      // Create a new chat in Firestore with the same title
      const newChat = await createChat(anonymousChat.title);
      
      // Add all messages in order
      for (const message of anonymousChat.messages) {
        await addMessageToChat(newChat.id, message.role, message.content);
      }
      
      console.log(`Migrated chat: ${anonymousChat.title}`);
    }
    
    console.log('Chat migration complete');
  } catch (error) {
    console.error('Error migrating chats:', error);
  }
};

// Export the function with the original name for backward compatibility
export const migrateAnonymousChatsToFirebase = migrateAnonymousChatsToFirestore; 