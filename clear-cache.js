// Cache clearing utility for Communication Preferences
// Add this to your browser console to clear all cached preference data

console.log('🧹 Clearing Communication Preferences Cache...');

// Clear localStorage items related to preferences
const keysToRemove = [
    'cachedPreferences',
    'preferenceCache',
    'communicationPreferences',
    'userPreferences',
    'preferencesData'
];

keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
    }
});

// Clear sessionStorage as well
keysToRemove.forEach(key => {
    if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`✅ Removed from session: ${key}`);
    }
});

// Force reload without cache
console.log('🔄 Forcing hard refresh...');
location.reload(true);

console.log('✅ Cache cleared! Page will refresh...');
