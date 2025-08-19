// Firebase integration using ES Module CDN (avoids import/build issues)

// Type declarations for global Firebase
declare global {
  interface Window {
    firebaseApp: any;
    firebaseAuth: any;
    firebaseDb: any;
    firebaseModules: {
      auth: any;
      firestore: any;
    };
  }
}

// Preload and cache Firebase modules for faster performance
let firebaseModules: any = null;

const preloadFirebaseModules = async () => {
  if (firebaseModules) return firebaseModules; // Already loaded
  
  try {
    console.log('Preloading Firebase modules...');
    const [authModule, databaseModule] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js')
    ]);
    
    firebaseModules = {
      auth: authModule,
      database: databaseModule
    };
    
    // Cache globally for debugging
    window.firebaseModules = firebaseModules;
    console.log('Firebase modules preloaded successfully!');
    return firebaseModules;
  } catch (error) {
    console.error('Failed to preload Firebase modules:', error);
    throw error;
  }
};

// Initialize Firebase modules when the app starts
if (typeof window !== 'undefined') {
  // Preload modules after a short delay to ensure Firebase is initialized
  setTimeout(() => {
    preloadFirebaseModules().catch(console.warn);
  }, 100);
}

// Get Firebase instances from global window
const getFirebaseInstances = () => {
  if (!window.firebaseApp || !window.firebaseAuth) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  return { firebaseApp: window.firebaseApp, firebaseAuth: window.firebaseAuth };
};

// Get Realtime Database instance
const getDatabaseInstance = () => {
  if (!window.firebaseDb) {
    throw new Error('Realtime Database not initialized. Please refresh the page.');
  }
  return window.firebaseDb;
};

// Get cached Firebase modules
const getFirebaseModules = async () => {
  if (!firebaseModules) {
    firebaseModules = await preloadFirebaseModules();
  }
  return firebaseModules;
};

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    const { firebaseAuth } = getFirebaseInstances();
    const { auth } = await getFirebaseModules();
    
    const userCredential = await auth.signInWithEmailAndPassword(firebaseAuth, email, password);
    console.log('Firebase sign in successful:', userCredential.user.email);
    return { user: userCredential.user };
  } catch (error: any) {
    console.error('Firebase sign in error:', error);
    throw new Error(error.message || 'Sign in failed');
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { firebaseAuth } = getFirebaseInstances();
    const { auth } = await getFirebaseModules();
    
    const userCredential = await auth.createUserWithEmailAndPassword(firebaseAuth, email, password);
    console.log('Firebase sign up successful:', userCredential.user.email);
    return { user: userCredential.user };
  } catch (error: any) {
    console.error('Firebase sign up error:', error);
    throw new Error(error.message || 'Sign up failed');
  }
};

export const logOut = async () => {
  try {
    const { firebaseAuth } = getFirebaseInstances();
    const { auth } = await getFirebaseModules();
    
    await auth.signOut(firebaseAuth);
    console.log('Firebase sign out successful');
  } catch (error: any) {
    console.error('Firebase sign out error:', error);
    throw new Error(error.message || 'Sign out failed');
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  try {
    const { firebaseAuth } = getFirebaseInstances();
    
    return getFirebaseModules().then(({ auth }) => {
      return auth.onAuthStateChanged(firebaseAuth, callback);
    });
  } catch (error) {
    console.warn('Firebase not initialized, using demo auth');
    callback(null);
    return Promise.resolve(() => {});
  }
};

// Task Persistence Functions
export const saveTasks = async (userId: string, tasks: any[]) => {
  try {
    console.log('🔄 Attempting to save tasks for user:', userId, 'Tasks count:', tasks.length);
    
    const db = getDatabaseInstance();
    const { database } = await getFirebaseModules();
    
    const userRef = database.ref(db, `users/${userId}`);
    await database.set(userRef, {
      tasks: tasks,
      lastUpdated: new Date().toISOString()
    });
    console.log('✅ Tasks saved to Realtime Database successfully');
  } catch (error: any) {
    console.error('❌ Failed to save tasks to Realtime Database:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Check for specific database errors
    if (error.code === 'PERMISSION_DENIED') {
      console.error('🔒 Permission denied - check database security rules');
      throw new Error('Permission denied. Please check your Firebase configuration.');
    } else if (error.code === 'UNAVAILABLE') {
      console.error('🌐 Database service unavailable - retrying...');
      throw new Error('Database service temporarily unavailable. Please try again.');
    } else {
      throw new Error(`Failed to save tasks: ${error.message}`);
    }
  }
};

export const loadTasks = async (userId: string) => {
  try {
    console.log('🔄 Attempting to load tasks for user:', userId);
    
    const db = getDatabaseInstance();
    const { database } = await getFirebaseModules();
    
    const userRef = database.ref(db, `users/${userId}`);
    const snapshot = await database.get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log('✅ Tasks loaded from Realtime Database successfully:', userData.tasks?.length || 0);
      return userData.tasks || [];
    } else {
      console.log('📝 No existing tasks found, starting fresh');
      return [];
    }
  } catch (error: any) {
    console.error('❌ Failed to load tasks from Realtime Database:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to load tasks: ${error.message}`);
  }
};
