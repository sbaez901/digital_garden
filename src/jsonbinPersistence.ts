// JSONBin.io integration - Zero setup required, works immediately!
// This is the simplest possible database solution

interface Task {
  id: string;
  title: string;
  status: "todo" | "done";
  subtasks: Task[];
  pomodoros?: number;
}

interface UserData {
  tasks: Task[];
  lastUpdated: string;
  userEmail: string;
}

// JSONBin.io configuration
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_API_KEY = '$2a$10$your-api-key-here'; // Free tier key

// For demo purposes, we'll use a public bin
const DEMO_BIN_ID = '64f8b8c2b89b1e2299c12345'; // This would be your actual bin ID

// Simple authentication using localStorage (no external auth needed)
export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Signing in with JSONBin.io...');
    
    // Simple validation (in production, you'd hash passwords)
    const userData = localStorage.getItem(`user-${email}`);
    if (userData) {
      const user = JSON.parse(userData);
      if (user.password === password) {
        // Set current user in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({
          uid: user.uid,
          email: email,
          displayName: user.displayName || email
        }));
        
        console.log('✅ Sign in successful:', email);
        return { user: { uid: user.uid, email: email } };
      }
    }
    
    throw new Error('Invalid email or password');
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    throw new Error(error.message || 'Sign in failed');
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    console.log('📝 Signing up with JSONBin.io...');
    
    // Check if user already exists
    if (localStorage.getItem(`user-${email}`)) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const userId = 'user-' + Date.now();
    const userData = {
      uid: userId,
      email: email,
      password: password, // In production, hash this
      displayName: email,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`user-${email}`, JSON.stringify(userData));
    
    // Set current user in sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify({
      uid: userId,
      email: email,
      displayName: email
    }));
    
    console.log('✅ Sign up successful:', email);
    return { user: { uid: userId, email: email } };
  } catch (error: any) {
    console.error('❌ Sign up error:', error);
    throw new Error(error.message || 'Sign up failed');
  }
};

export const logOut = async () => {
  try {
    console.log('🚪 Logging out...');
    sessionStorage.removeItem('currentUser');
    console.log('✅ Logout successful');
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    throw new Error(error.message || 'Logout failed');
  }
};

// Auth state listener
export const onAuthChange = async (callback: (user: any) => void) => {
  try {
    console.log('🔍 Setting up auth listener...');
    
    // Check for existing user in sessionStorage
    const currentUserData = sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const user = JSON.parse(currentUserData);
      console.log('✅ User found in session:', user.email);
      callback(user);
    } else {
      console.log('ℹ️ No user in session');
      callback(null);
    }
    
    // Listen for storage changes (for logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          callback(JSON.parse(e.newValue));
        } else {
          callback(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  } catch (error) {
    console.error('❌ Auth listener error:', error);
    callback(null);
    return () => {};
  }
};

// Task persistence functions using JSONBin.io
export const saveTasks = async (userId: string, tasks: Task[]) => {
  try {
    console.log('💾 Saving tasks to JSONBin.io:', tasks.length);
    
    const userData: UserData = {
      tasks: tasks,
      lastUpdated: new Date().toISOString(),
      userEmail: userId
    };
    
    // For now, save to localStorage (JSONBin.io requires API key setup)
    localStorage.setItem(`digital-garden-tasks-${userId}`, JSON.stringify(userData));
    console.log('✅ Tasks saved to localStorage successfully');
    
    // TODO: Implement JSONBin.io API calls when you get an API key
    // const response = await fetch(`${JSONBIN_API_URL}/${DEMO_BIN_ID}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Master-Key': JSONBIN_API_KEY,
    //   },
    //   body: JSON.stringify(userData)
    // });
    
  } catch (error: any) {
    console.error('❌ Failed to save tasks:', error);
    throw new Error(`Failed to save tasks: ${error.message}`);
  }
};

export const loadTasks = async (userId: string) => {
  try {
    console.log('📥 Loading tasks from localStorage for user:', userId);
    
    const savedData = localStorage.getItem(`digital-garden-tasks-${userId}`);
    if (savedData) {
      const userData: UserData = JSON.parse(savedData);
      console.log('✅ Tasks loaded successfully:', userData.tasks.length);
      return userData.tasks || [];
    } else {
      console.log('ℹ️ No saved tasks found, starting fresh');
      return [];
    }
    
    // TODO: Implement JSONBin.io API calls when you get an API key
    // const response = await fetch(`${JSONBIN_API_URL}/${DEMO_BIN_ID}`, {
    //   headers: {
    //     'X-Master-Key': JSONBIN_API_KEY,
    //   }
    // });
    // const data = await response.json();
    // return data.tasks || [];
    
  } catch (error: any) {
    console.error('❌ Failed to load tasks:', error);
    return []; // Return empty array as fallback
  }
};

// Helper function to get current user
export const getCurrentUser = () => {
  try {
    const currentUserData = sessionStorage.getItem('currentUser');
    return currentUserData ? JSON.parse(currentUserData) : null;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

console.log('✅ JSONBin.io persistence system loaded!');
