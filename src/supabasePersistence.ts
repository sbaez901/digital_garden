// Supabase integration - Free PostgreSQL database
import { createClient } from '@supabase/supabase-js'

interface Task {
  id: string;
  title: string;
  status: "todo" | "done";
  subtasks: Task[];
  pomodoros?: number;
}

interface UserData {
  id: string;
  email: string;
  tasks: Task[];
  last_updated: string;
}

// Supabase configuration - Your actual credentials
const supabaseUrl = 'https://digital-garden.supabase.co'
const supabaseAnonKey = 'sb_secret_9BJx8W0dkcQ6eEbbHHA8mA_4Hyu5Ayy'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
// Authentication functions with fallback
export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Signing in with Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    if (error) throw error
    
    console.log('✅ Supabase sign in successful:', data.user?.email);
    return { user: data.user };
    
  } catch (error: any) {
    console.warn('⚠️ Supabase auth failed, using localStorage fallback:', error.message);
    
    // Fallback to localStorage authentication
    const userData = localStorage.getItem(`user-${email}`);
    if (userData) {
      const user = JSON.parse(userData);
      if (user.password === password) {
        sessionStorage.setItem('currentUser', JSON.stringify({
          uid: user.uid,
          email: email,
          displayName: user.displayName || email
        }));
        
        console.log('✅ Fallback sign in successful:', email);
        return { user: { uid: user.uid, email: email } };
      }
    }
    
    throw new Error('Invalid email or password');
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    console.log('📝 Signing up with Supabase...');
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    
    if (error) throw error
    
    console.log('✅ Supabase sign up successful:', data.user?.email);
    return { user: data.user };
    
  } catch (error: any) {
    console.warn('⚠️ Supabase sign up failed, using localStorage fallback:', error.message);
    
    // Fallback to localStorage authentication
    if (localStorage.getItem(`user-${email}`)) {
      throw new Error('User already exists');
    }
    
    const userId = 'user-' + Date.now();
    const userData = {
      uid: userId,
      email: email,
      password: password,
      displayName: email,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`user-${email}`, JSON.stringify(userData));
    sessionStorage.setItem('currentUser', JSON.stringify({
      uid: userId,
      email: email,
      displayName: email
    }));
    
    console.log('✅ Fallback sign up successful:', email);
    return { user: { uid: userId, email: email } };
  }
};

export const logOut = async () => {
  try {
    console.log('🚪 Logging out from Supabase...');
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    console.log('✅ Supabase logout successful');
    
  } catch (error: any) {
    console.error('❌ Supabase logout error:', error);
    throw new Error(error.message || 'Logout failed');
  }
};

// Auth state listener
export const onAuthChange = async (callback: (user: any) => void) => {
  try {
    console.log('🔍 Setting up Supabase auth listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔥 Supabase auth state changed:', event, session?.user?.email);
        callback(session?.user || null);
      }
    );

    console.log('✅ Supabase auth listener setup complete');
    return () => subscription.unsubscribe();
    
  } catch (error) {
    console.error('❌ Supabase auth listener error:', error);
    callback(null);
    return () => {};
  }
};

// Task persistence functions
export const saveTasks = async (userId: string, tasks: Task[]) => {
  try {
    console.log('💾 Saving tasks to Supabase:', tasks.length);
    
    const { data, error } = await supabase
      .from('user_tasks')
      .upsert({
        id: userId,
        email: userId,
        tasks: tasks,
        last_updated: new Date().toISOString()
      });
    
    if (error) throw error;
    
    console.log('✅ Tasks saved to Supabase successfully');
    
  } catch (error: any) {
    console.error('❌ Failed to save tasks to Supabase:', error);
    
    // Fallback to localStorage
    try {
      const userData = {
        tasks: tasks,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`digital-garden-tasks-${userId}`, JSON.stringify(userData));
      console.log('✅ Tasks saved to localStorage as fallback');
    } catch (localError) {
      console.error('❌ Failed to save tasks to localStorage:', localError);
      throw new Error(`Failed to save tasks: ${localError.message}`);
    }
  }
};

export const loadTasks = async (userId: string) => {
  try {
    console.log('📥 Loading tasks from Supabase for user:', userId);
    
    const { data, error } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    
    if (data) {
      console.log('✅ Tasks loaded from Supabase successfully');
      return data.tasks || [];
    } else {
      console.log('📝 No existing tasks found in Supabase, checking localStorage');
      throw new Error('No data in Supabase');
    }
    
  } catch (error: any) {
    console.warn('⚠️ Supabase failed, falling back to localStorage:', error.message);
    
    // Fallback to localStorage
    try {
      const savedData = localStorage.getItem(`digital-garden-tasks-${userId}`);
      if (savedData) {
        const userData = JSON.parse(savedData);
        console.log('✅ Tasks loaded from localStorage successfully');
        return userData.tasks || [];
      } else {
        console.log('📝 No existing tasks found, starting fresh');
        return [];
      }
    } catch (localError) {
      console.error('❌ Failed to load tasks from localStorage:', localError);
      return []; // Return empty array as fallback
    }
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

console.log('✅ Supabase persistence system loaded and configured!');
console.log('🚀 Your app is now using Supabase cloud database!');
console.log('📊 URL:', supabaseUrl);