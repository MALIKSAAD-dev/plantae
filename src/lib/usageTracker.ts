// Feature usage limits for non-authenticated users
export const FREE_USAGE_LIMITS = {
  identification: 3,  // 3 free identifications
  health: 1,         // 1 free health analysis
  chat: 1            // 1 free chat session
};

// Key names for localStorage
const USAGE_KEYS = {
  identification: 'plantae_free_identification_count',
  health: 'plantae_free_health_count',
  chat: 'plantae_free_chat_count'
};

/**
 * Increment usage count for a specific feature
 * @param feature The feature to track usage for
 * @returns Updated usage count
 */
export const incrementUsage = (feature: 'identification' | 'health' | 'chat'): number => {
  // Don't increment if localStorage is not available (rare edge case)
  if (typeof localStorage === 'undefined') return 0;
  
  const currentCount = getUsageCount(feature);
  const newCount = currentCount + 1;
  localStorage.setItem(USAGE_KEYS[feature], newCount.toString());
  
  return newCount;
};

/**
 * Get current usage count for a feature
 * @param feature The feature to check usage for
 * @returns Current usage count
 */
export const getUsageCount = (feature: 'identification' | 'health' | 'chat'): number => {
  if (typeof localStorage === 'undefined') return 0;
  
  const count = localStorage.getItem(USAGE_KEYS[feature]);
  return count ? parseInt(count, 10) : 0;
};

/**
 * Check if user has reached the limit for a feature
 * @param feature The feature to check
 * @returns Boolean indicating if user reached usage limit
 */
export const hasReachedLimit = (feature: 'identification' | 'health' | 'chat'): boolean => {
  const count = getUsageCount(feature);
  return count >= FREE_USAGE_LIMITS[feature];
};

/**
 * Reset usage counters for all features
 * Typically called after user signs in
 */
export const resetAllUsage = (): void => {
  if (typeof localStorage === 'undefined') return;
  
  localStorage.setItem(USAGE_KEYS.identification, '0');
  localStorage.setItem(USAGE_KEYS.health, '0');
  localStorage.setItem(USAGE_KEYS.chat, '0');
};

/**
 * Get remaining usages for a feature
 * @param feature The feature to check
 * @returns Number of remaining usages before limit
 */
export const getRemainingUsage = (feature: 'identification' | 'health' | 'chat'): number => {
  const currentUsage = getUsageCount(feature);
  const limit = FREE_USAGE_LIMITS[feature];
  
  return Math.max(0, limit - currentUsage);
}; 