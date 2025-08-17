import { useState, useMemo, useEffect } from "react";
// import { useAuth } from "./AuthContext";
import { signIn, signUp } from "./firebase";
// import { logOut } from "./firebase";
// import Auth from "./Auth.jsx";
import LofiPlayer from "./components/LofiPlayer";

interface Task {
  id: string;
  title: string;
  status: "todo" | "done";
  subtasks: Task[];
  pomodoros?: number; // Track completed pomodoros for this task
}

export default function DigitalGardenApp() {
  // User state management
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Preload Firebase modules for faster performance
  useEffect(() => {
    const preloadFirebase = async () => {
      try {
        // Preload firebase module in background
        await import("./firebase");
        console.log("Firebase module preloaded for faster task loading");
      } catch (error) {
        console.warn("Could not preload Firebase module");
      }
    };
    
    // Preload after a short delay to ensure app is ready
    const timeoutId = setTimeout(preloadFirebase, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Save tasks to Firebase whenever they change
  useEffect(() => {
    if (currentUser && tasks.length > 0) {
      const saveTasksToFirebase = async () => {
        try {
          const { saveTasks } = await import("./firebase");
          await saveTasks(currentUser.uid, tasks);
        } catch (error) {
          console.warn("Could not save tasks to Firebase");
        }
      };
      
      // Debounce the save to avoid too many Firebase calls
      const timeoutId = setTimeout(saveTasksToFirebase, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [tasks, currentUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const { logOut } = await import("./firebase");
      await logOut();
      setCurrentUser(null);
      setTasks([]); // Clear tasks on logout
      console.log("User logged out successfully");
    } catch (error: any) {
      console.error("Logout error", error);
    }
  };

  // Handle authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSigningIn(true);

    try {
      if (authEmail && authPassword) {
        // Call real Firebase authentication
        let userResult;
        if (isSignUp) {
          userResult = await signUp(authEmail, authPassword);
          console.log("Firebase sign up successful:", authEmail);
        } else {
          userResult = await signIn(authEmail, authPassword);
          console.log("Firebase login successful:", authEmail);
        }
        
        // Set the current user and close modal immediately
        setCurrentUser(userResult.user);
        setShowAuth(false);
        setAuthEmail("");
        setAuthPassword("");
        
        // Load user's saved tasks in the background (non-blocking)
        // Load user's saved tasks in the background (non-blocking)
        setIsLoadingTasks(true);
        
        // Start loading immediately (no delay)
        (async () => {
          try {
            const { loadTasks } = await import("./firebase");
            const savedTasks = await loadTasks(userResult.user.uid);
            setTasks(savedTasks);
            console.log("User tasks loaded from Firebase");
          } catch (error) {
            console.warn("Could not load tasks, starting fresh");
            setTasks([]);
          } finally {
            setIsLoadingTasks(false);
          }
        })();
      } else {
        setAuthError("Please fill in all fields");
      }
    } catch (error: any) {
      setAuthError(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // Pomodoro Timer State
  const [timerState, setTimerState] = useState<'work' | 'shortBreak' | 'longBreak' | 'idle'>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(undefined);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Tab Interface State
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'tasks'>('tasks');

  // Puzzle Garden System
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const [revealedPieces, setRevealedPieces] = useState<number>(0);
  const [puzzleVersion, setPuzzleVersion] = useState(0); // Force new random image selection

  
  // Seasonal garden configurations
  const seasonalGardens = {
    spring: {
      name: 'Cherry Blossom Spring Garden',
      pieces: 12,
      colors: ['from-pink-100 to-rose-200', 'from-pink-200 to-rose-300'],
      theme: '🌸 Spring Renewal'
    },
    summer: {
      name: 'Lavender Summer Garden',
      pieces: 10,
      colors: ['from-purple-100 to-indigo-200', 'from-purple-200 to-indigo-300'],
      theme: '🌿 Summer Abundance'
    },
    autumn: {
      name: 'Maple Autumn Garden',
      pieces: 8,
      colors: ['from-orange-100 to-red-200', 'from-orange-200 to-red-300'],
      theme: '🍂 Autumn Warmth'
    },
    winter: {
      name: 'Snow Winter Garden',
      pieces: 6,
      colors: ['from-blue-100 to-slate-200', 'from-blue-200 to-slate-300'],
      theme: '❄️ Winter Serenity'
    }
  };

  // Get current season based on date
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason('spring');
    else if (month >= 5 && month <= 7) setCurrentSeason('summer');
    else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);



  // Reveal puzzle piece function
  const revealPuzzlePiece = () => {
    const currentGarden = seasonalGardens[currentSeason];
    if (revealedPieces < currentGarden.pieces) {
      setRevealedPieces(prev => {
        const newCount = prev + 1;
        
        // Check if puzzle is complete
        if (newCount >= currentGarden.pieces) {
          // Puzzle complete! Auto-reset after a short delay
          setTimeout(() => {
            setRevealedPieces(0); // Reset puzzle pieces
            // Force a new random image by incrementing puzzle version
            setPuzzleVersion(prev => prev + 1);
          }, 2000); // 2 second delay to show completion message
        }
        
        return newCount;
      });
    }
  };
  
  // Override task completion to trigger puzzle piece reveal
  const completeTaskFromPomodoro = (taskId: string) => {
    setTasks(tasks.map(task => {
      // Check if current task is a main task
      if (task.id === taskId) {
        playSound('task-complete');
        revealPuzzlePiece(); // Reveal puzzle piece
        return { ...task, status: 'done' };
      }
      // Check if current task is a subtask
      if (task.subtasks.some(subtask => subtask.id === taskId)) {
        playSound('task-complete');
        revealPuzzlePiece(); // Reveal puzzle piece
        return {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === taskId
              ? { ...subtask, status: 'done' }
              : subtask
          )
        };
      }
      return task;
    }));
    
    // If the completed task was the current timer task, clear it
    if (currentTaskId === taskId) {
      setCurrentTaskId(undefined);
    }
  };

  



  // Dynamic day/night cycle effect
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }, []);

  const timeTheme = useMemo(() => {
    switch (timeOfDay) {
      case 'morning':
        return {
          bgGradient: 'from-yellow-100 to-orange-100',
          textColor: 'text-orange-800',
          icon: '🌅',
          message: 'Good morning! Your garden is waking up with the sun.'
        };
      case 'afternoon':
        return {
          bgGradient: 'from-emerald-100 to-green-200',
          textColor: 'text-emerald-800',
          icon: '☀️',
          message: 'Good afternoon! Your garden is basking in the warm sunlight.'
        };
      case 'evening':
        return {
          bgGradient: 'from-orange-100 to-pink-100',
          textColor: 'text-orange-800',
          icon: '🌆',
          message: 'Good evening! Your garden is glowing with sunset colors.'
        };
      case 'night':
        return {
          bgGradient: 'from-blue-100 to-indigo-100',
          textColor: 'text-indigo-800',
          icon: '🌙',
          message: 'Good night! Your garden is resting under the moonlight.'
        };
      default:
        return {
          bgGradient: 'from-emerald-100 to-green-200',
          textColor: 'text-emerald-800',
          icon: '🌿',
          message: 'Welcome to your garden!'
        };
    }
  }, [timeOfDay]);

  // Pomodoro Timer Functions
  const startTimer = (type: 'work' | 'shortBreak' | 'longBreak', taskId?: string) => {
    // If we're already in a work session and just switching tasks, don't reset
    const isSwitchingTasks = timerState === 'work' && type === 'work' && currentTaskId !== taskId;
    const isNewSessionType = timerState !== type;
    
    setTimerState(type);
    setCurrentTaskId(taskId || undefined);
    
    // Only reset timer if it's a new session type, not when switching tasks
    if (isNewSessionType && !isSwitchingTasks) {
      switch (type) {
        case 'work':
          setTimeLeft(25 * 60); // 25 minutes
          playSound('timer-start');
          break;
        case 'shortBreak':
          setTimeLeft(5 * 60); // 5 minutes
          playSound('break-start');
          break;
        case 'longBreak':
          setTimeLeft(15 * 60); // 15 minutes
          playSound('break-start');
          break;
      }
    }
    
    // Only start running if it's a new session type or if timer was stopped
    if (isNewSessionType || !isRunning) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimerState('idle');
    setTimeLeft(25 * 60);
    setCurrentTaskId(undefined);
  };

  const completePomodoro = () => {
    if (currentTaskId && timerState === 'work') {
      setTasks(tasks.map(task => {
        // Check if current task is a main task
        if (task.id === currentTaskId) {
          return { ...task, pomodoros: (task.pomodoros || 0) + 1 };
        }
        // Check if current task is a subtask
        if (task.subtasks.some(subtask => subtask.id === currentTaskId)) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === currentTaskId
                ? { ...subtask, pomodoros: (subtask.pomodoros || 0) + 1 }
                : subtask
            )
          };
        }
        return task;
      }));
      setCompletedPomodoros(prev => prev + 1);
      playSound('timer-end');
    }
    
    // Move to next session
    if (timerState === 'work') {
      setCompletedSessions(prev => prev + 1);
      if (completedSessions % 4 === 3) {
        startTimer('longBreak');
      } else {
        startTimer('shortBreak');
      }
    } else {
      startTimer('work', currentTaskId);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completePomodoro();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer theme based on current state
  const timerTheme = useMemo(() => {
    switch (timerState) {
      case 'work':
        return {
          bgColor: 'bg-emerald-400',
          textColor: 'text-emerald-700',
          icon: '🍅',
          label: 'Work Time',
          description: 'Focus on your task and watch your garden grow!'
        };
      case 'shortBreak':
        return {
          bgColor: 'bg-green-500',
          textColor: 'text-green-700',
          icon: '🌿',
          label: 'Short Break',
          description: 'Take a quick break and water your plants!'
        };
      case 'longBreak':
        return {
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          icon: '🌸',
          label: 'Long Break',
          description: 'Enjoy a longer break and see your flowers bloom!'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-700',
          icon: '🌱',
          label: 'Ready to Start',
          description: 'Choose a task and start your Pomodoro session!'
        };
    }
  }, [timerState]);

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      status: "todo",
      subtasks: []
    };
    setTasks([...tasks, newTask]);
  };

  const addSubtask = (parentId: string) => {
    const newSubtask: Task = {
      id: Date.now().toString(),
      title: "Click to edit subtask",
      status: "todo",
      subtasks: []
    };
    
    setTasks(tasks.map(task => 
      task.id === parentId 
        ? { ...task, subtasks: [...task.subtasks, newSubtask] }
        : task
    ));
    
    setExpandedTasks(prev => new Set([...prev, parentId]));
    
    // Start editing the new subtask immediately
    setTimeout(() => {
      setEditingId(newSubtask.id);
      setEditingTitle("Click to edit subtask");
    }, 100);
  };

  const toggleStatus = (id: string, parentId?: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
      if (parentId) {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === id
                  ? { ...subtask, status: (subtask.status === 'done' ? 'todo' : 'done') as 'todo' | 'done' }
                : subtask
            )
          };
        }
        return task;
      } else {
        if (task.id === id) {
            return { ...task, status: (task.status === 'done' ? 'todo' : 'done') as 'todo' | 'done' };
        }
        return task;
      }
      });
      
      // Check if this task/subtask was just completed
      const task = updatedTasks.find(t => parentId ? t.id === parentId : t.id === id);
      if (task) {
        if (parentId) {
          // Subtask completion
          const subtask = task.subtasks.find(st => st.id === id);
          if (subtask && subtask.status === 'done') {
            setTimeout(() => revealPuzzlePiece(), 0);
          }
        } else {
          // Main task completion
          if (task.status === 'done') {
            setTimeout(() => revealPuzzlePiece(), 0);
          }
        }
      }
      
      return updatedTasks;
    });
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const startEditingSubtask = (subtask: Task, parentId: string) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
    // Store parent ID for subtask editing
    setEditingParentId(parentId);
  };

  const saveEdit = () => {
    if (editingId && editingTitle.trim()) {
      if (editingParentId) {
        // Editing a subtask
        setTasks(tasks.map(task => 
          task.id === editingParentId 
            ? { 
                ...task, 
                subtasks: task.subtasks.map(subtask =>
                  subtask.id === editingId 
                    ? { ...subtask, title: editingTitle.trim() }
                    : subtask
                )
              }
            : task
        ));
      } else {
        // Editing a main task
      setTasks(tasks.map(task => 
        task.id === editingId 
          ? { ...task, title: editingTitle.trim() }
          : task
      ));
      }
    }
    setEditingId(null);
    setEditingTitle("");
    setEditingParentId(null);
  };

  const deleteTask = (id: string, parentId?: string) => {
    if (parentId) {
      setTasks(tasks.map(task => 
        task.id === parentId 
          ? { ...task, subtasks: task.subtasks.filter(subtask => subtask.id !== id) }
          : task
      ));
    } else {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const renderTask = (task: Task, level: number = 0, parentId?: string) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks.length > 0;
    
    return (
      <div key={task.id} className={`${level > 0 ? 'ml-6 border-l-2 border-emerald-200 pl-4' : ''}`}>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 flex-1">
            {hasSubtasks && (
              <button
                onClick={() => toggleExpanded(task.id)}
                className="text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            {editingId === task.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={saveEdit}
                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 mr-2"
                autoFocus
              />
            ) : (
              <span 
                className="text-gray-800 font-medium cursor-pointer hover:text-emerald-700"
                onClick={() => level === 0 ? startEditing(task) : startEditingSubtask(task, parentId!)}
              >
                {task.title}
              </span>
            )}
            
            {hasSubtasks && (
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                {task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}
              </span>
            )}
            
            {/* Pomodoro Count */}
            {task.pomodoros && task.pomodoros > 0 && (
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                {task.pomodoros} 🍅
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleStatus(task.id, parentId)}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                task.status === 'done'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 hover:border-green-400'
              }`}
              title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.status === 'done' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {level === 0 && (
              <button
                onClick={() => addSubtask(task.id)}
                className="text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                title="Add subtask"
              >
                +⊂
              </button>
            )}
            
            <button
              onClick={() => deleteTask(task.id, parentId)}
              className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
        
        {hasSubtasks && isExpanded && (
          <div className="mt-3 space-y-3">
            {task.subtasks.map(subtask => renderTask(subtask, level + 1, task.id))}
          </div>
        )}
      </div>
    );
  };

  // Sound Management
  const [volume, setVolume] = useState(0.5);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  // Sound functions
  const playSound = (type: 'timer-start' | 'timer-end' | 'task-complete' | 'break-start') => {
    if (!soundsEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Different sounds for different events
    switch (type) {
      case 'timer-start':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.5);
        break;
      case 'timer-end':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
        break;
      case 'task-complete':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
        break;
      case 'break-start':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.4);
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-emerald-800 mb-8 text-center">
          🌱 Task Garden
        </h1>
        
                  {/* Header with User Management */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              <div className="text-gray-500">
                {currentUser ? `Welcome back, ${currentUser.email}! 🌱` : "Welcome to Task Garden! 🌱"}
              </div>
            </div>
            <div>
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-700 font-medium">
                      {currentUser.email}
                    </span>
                    {isLoadingTasks && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-emerald-200 hover:border-emerald-300 hover:shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              )}
            </div>
          </div>
        
        {/* Garden Visualization - Always Visible */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">🌿 Your Growing Garden</h2>
          
          {/* Season Selector */}
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
                <button
                  key={season}
                  onClick={() => {
                    setCurrentSeason(season);
                    setRevealedPieces(0); // Reset puzzle for new season
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentSeason === season
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="mr-2">
                    {season === 'spring' ? '🌸' : 
                     season === 'summer' ? '🌿' : 
                     season === 'autumn' ? '🍂' : '❄️'}
                  </span>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Time-based Welcome Message */}
          <div className="text-center mb-4">
            <p className={`text-sm ${timeTheme.textColor} font-medium`}>
              {timeTheme.message}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Puzzle Illustration and Tip */}
            <div className="space-y-6">
              {/* Garden Canvas */}
              <div className={`relative bg-gradient-to-b ${timeTheme.bgGradient} rounded-lg p-6 h-96 overflow-hidden transition-all duration-1000`}>

              
              {/* Sophisticated Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)`
                }}></div>
              </div>
              
              {/* Puzzle Garden Grid */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative" style={{
                  width: '100%',
                  height: '100%'
                }}>
                  {/* Simple fade-in reveal system */}
                  {(() => {
                    // Get all available images for the current season
                    const getSeasonImages = (season: string) => {
                      switch (season) {
                        case 'spring': return [
                          '/images/spring/2151979634.jpg',
                          '/images/spring/Copilot_20250815_213440.png',
                          '/images/spring/Aug 15, 2025, 09_28_19 PM.png',
                          '/images/spring/Spring Garden Serenity.png'
                        ];
                        case 'summer': return [
                          '/images/summer/12690066_5024465.jpg',
                          '/images/summer/38892778_8684227.jpg',
                          '/images/summer/14666573_5487691.jpg',
                          '/images/summer/38680622_8658334.jpg',
                          '/images/summer/2151464672.jpg',
                          '/images/summer/40129509_8728381.jpg',
                          '/images/summer/49664024_9210295.jpg'
                        ];
                        case 'autumn': return [
                          '/images/autumn/20282241_6241477.jpg',
                          '/images/autumn/20547571_6261886.jpg',
                          '/images/autumn/20547574_6261887.jpg',
                          '/images/autumn/9259712_4103455.jpg',
                          '/images/autumn/16390915_5752424.jpg',
                          '/images/autumn/16391197_5735750.jpg',
                          '/images/autumn/cozy-autumn-scene-house-path-flowers.jpg',
                          '/images/autumn/10100663.jpg'
                        ];
                        case 'winter': return [];
                        default: return [];
                      }
                    };
                    
                    const seasonImages = getSeasonImages(currentSeason);
                    let imageSrc = null;
                    
                    if (seasonImages.length > 0) {
                      // Use a combination of season, current time, and puzzle version to get different images
                      // This ensures variety while keeping the same image during a session
                      const timeSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Changes daily
                      const seasonSeed = currentSeason.charCodeAt(0) + currentSeason.charCodeAt(1);
                      const combinedSeed = timeSeed + seasonSeed + puzzleVersion;
                      const imageIndex = combinedSeed % seasonImages.length;
                      imageSrc = seasonImages[imageIndex];
                      
                      // Debug logging to verify randomization
                      console.log(`🎲 Season: ${currentSeason}, Time Seed: ${timeSeed}, Season Seed: ${seasonSeed}, Puzzle Version: ${puzzleVersion}, Combined: ${combinedSeed}, Image Index: ${imageIndex}, Selected: ${imageSrc.split('/').pop()}`);
                    }
                    
                    if (!imageSrc) {
                      return (
                        <div 
                          className="w-full h-full rounded-lg"
                      style={{
                            background: `linear-gradient(135deg, ${seasonalGardens[currentSeason].colors[0]}, ${seasonalGardens[currentSeason].colors[1]})`
                          }}
                        />
                      );
                    }
                    
                    return (
                      <div className="w-full h-full relative">
                        {/* Background image with fade-in effect */}
                        <img 
                          src={imageSrc} 
                          alt="Seasonal Garden"
                          className="w-full h-full object-cover rounded-lg transition-opacity duration-1000"
                          style={{
                            opacity: revealedPieces / seasonalGardens[currentSeason].pieces
                          }}
                        />
                        
                        {/* Colored overlay that fades out as image appears */}
                        <div 
                          className="absolute inset-0 transition-opacity duration-1000 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${seasonalGardens[currentSeason].colors[0]}, ${seasonalGardens[currentSeason].colors[1]})`,
                            opacity: 1 - (revealedPieces / seasonalGardens[currentSeason].pieces), // Inverse of image opacity
                            zIndex: 10
                          }}
                        />
                        

                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Garden Stats Overlay */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 text-sm shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{revealedPieces}/{seasonalGardens[currentSeason].pieces}</div>
                  <div className="text-gray-600 font-medium">Puzzle Pieces</div>
                  {revealedPieces === seasonalGardens[currentSeason].pieces && (
                    <div className="mt-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                      🎉 Puzzle Complete! 🚀 New puzzle loading...
                    </div>
                  )}
                </div>
              </div>
              </div>
              
                               {/* Tip Section - Below the puzzle illustration */}
                 <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-3 border border-slate-100/50">
                   <div className="flex items-start gap-2">
                     <span className="text-base text-amber-500">💡</span>
                     <div className="text-xs text-gray-700">
                       <span className="font-semibold">Tip:</span> Complete tasks to reveal puzzle pieces! Each completed task reveals part of your seasonal garden image.
                     </div>
                   </div>
                 </div>
            </div>
            
            {/* Right Column - Stats, Puzzle Progress, and Lofi Player */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 text-center transform hover:scale-105 transition-all duration-300 shadow-sm border border-emerald-100/50">
                  <div className="text-2xl font-bold text-emerald-700 mb-0.5">{revealedPieces}</div>
                  <div className="text-xs text-emerald-600 font-medium">Puzzle Pieces</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center transform hover:scale-105 transition-all duration-300 shadow-sm border border-blue-100/50">
                  <div className="text-2xl font-bold text-blue-700 mb-0.5">{seasonalGardens[currentSeason].pieces}</div>
                  <div className="text-xs text-blue-600 font-medium">Total Pieces</div>
                  </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 text-center transform hover:scale-105 transition-all duration-300 shadow-sm border border-amber-100/50">
                  <div className="text-2xl font-bold text-amber-700 mb-0.5">{Math.round((revealedPieces / seasonalGardens[currentSeason].pieces) * 100)}%</div>
                  <div className="text-xs text-amber-600 font-medium">Complete</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100/50">
                <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                  <span className="text-base">🧩</span>
                  Puzzle Progress
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-2.5 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${(revealedPieces / seasonalGardens[currentSeason].pieces) * 100}%` }}
                  >
                    {/* Subtle Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  {revealedPieces === seasonalGardens[currentSeason].pieces ? '🎉 Puzzle Complete! 🚀 New puzzle loading...' :
                   revealedPieces > seasonalGardens[currentSeason].pieces * 0.7 ? '🌺 Almost there!' :
                   revealedPieces > seasonalGardens[currentSeason].pieces * 0.4 ? '🌿 Great progress!' :
                   revealedPieces > 0 ? '🌱 Keep going!' :
                   '🌱 Start completing tasks to reveal the puzzle!'}
                </div>
              </div>
              
              {/* Compact Lofi Music Player */}
              <LofiPlayer currentSeason={currentSeason} />
            </div>
          </div>
        </div>
        
        {/* Tab Navigation - Only for Pomodoro and Tasks */}
        <div className="bg-white rounded-lg shadow-lg p-2 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📝 Task Management
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'pomodoro'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🍅 Pomodoro Timer
            </button>

          </div>
        </div>
        
        {activeTab === 'pomodoro' && (
          <>
            {/* Pomodoro Timer */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">🍅 Pomodoro Garden Timer</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timer Display */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${timerState === 'work' ? 'from-emerald-500 to-emerald-600' : timerState === 'shortBreak' ? 'from-blue-400 to-blue-500' : timerState === 'longBreak' ? 'from-blue-500 to-blue-600' : 'from-gray-400 to-gray-500'} text-white mb-4 transition-all duration-500 shadow-lg`}>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
                      <div className="text-sm opacity-90">{timerTheme.label}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600">{timerTheme.description}</p>
                    {currentTaskId && timerState === 'work' && (
                      <p className="text-sm text-emerald-600 mt-1">
                        💡 <strong>Tip:</strong> Click different tasks to switch focus - timer keeps running!
                      </p>
                    )}
                  </div>
                  
                  {/* Timer Controls */}
                  <div className="flex justify-center gap-3 mb-4">
                    {!isRunning ? (
                      <button
                        onClick={() => startTimer('work', currentTaskId)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        {timerState === 'idle' ? 'Start Work' : 'Resume'}
                      </button>
                    ) : (
                      <button
                        onClick={pauseTimer}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Pause
                      </button>
                    )}
                    
                    <button
                      onClick={resetTimer}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  
                  {/* Quick Start Buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => startTimer('shortBreak')}
                      className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Short Break
                    </button>
                    <button
                      onClick={() => startTimer('longBreak')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Long Break
                    </button>
                  </div>
                </div>
                
                {/* Timer Stats & Task Selection */}
                <div className="space-y-4">
                  {/* Current Task */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">🎯 Current Task</h3>
                    {currentTaskId ? (
                      <div className="space-y-2">
                        {/* Find and display the current task */}
                        {(() => {
                          // First check if it's a main task
                          const mainTask = tasks.find(t => t.id === currentTaskId);
                          if (mainTask) {
                            return (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">📋 {mainTask.title}</span>
                                <span className="text-sm text-emerald-700">
                                  {mainTask.pomodoros || 0} 🍅
                                </span>
                              </div>
                            );
                          }
                          
                          // If not a main task, check if it's a subtask
                          for (const task of tasks) {
                            const subtask = task.subtasks.find(st => st.id === currentTaskId);
                            if (subtask) {
                              return (
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-500">{task.title}</div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700">└ {subtask.title}</span>
                                    <span className="text-sm text-emerald-700">
                                      {subtask.pomodoros || 0} 🍅
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          }
                          
                          return (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Unknown Task</span>
                              <span className="text-sm text-emerald-600">0 🍅</span>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No task selected</p>
                    )}
                  </div>
                  
                  {/* Task Selection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">📝 Select Task to Work On</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {/* Main Tasks */}
                      {tasks.filter(task => task.status !== 'done').map(task => (
                        <div key={task.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startTimer('work', task.id)}
                              className={`flex-1 text-left p-2 rounded text-sm transition-colors ${
                                currentTaskId === task.id 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : 'bg-white hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">📋 {task.title}</span>
                                <span className="text-emerald-700 text-xs">
                                  {task.pomodoros || 0} 🍅
                                </span>
                              </div>
                            </button>
                            <button
                              onClick={() => completeTaskFromPomodoro(task.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Mark as complete"
                            >
                              ✓
                            </button>
                          </div>
                          
                          {/* Subtasks */}
                          {task.subtasks.filter(subtask => subtask.status !== 'done').map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => startTimer('work', subtask.id)}
                                className={`flex-1 text-left p-2 rounded text-sm transition-colors ${
                                  currentTaskId === subtask.id 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate">└ {subtask.title}</span>
                                  <span className="text-emerald-700 text-xs">
                                    {subtask.pomodoros || 0} 🍅
                                  </span>
                                </div>
                              </button>
                              <button
                                onClick={() => completeTaskFromPomodoro(subtask.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                                title="Mark as complete"
                              >
                                ✓
                              </button>
                            </div>
                          ))}
                        </div>
                      ))}
                      {tasks.filter(task => task.status !== 'done').length === 0 && (
                        <p className="text-gray-500 text-sm">No tasks available</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Timer Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-700">{completedPomodoros}</div>
                      <div className="text-sm text-emerald-800">Pomodoros</div>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{completedSessions}</div>
                      <div className="text-sm text-blue-700">Sessions</div>
                    </div>
                  </div>
                  
                  {/* Clear Data Button */}
                  <div className="text-center mt-4">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      title="Clear all data and start fresh"
                    >
                      🗑️ Clear All Data
                    </button>
                  </div>
                  
                  {/* Sound Controls */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2 text-center">🔊 Sound Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Sounds</span>
                        <button
                          onClick={() => setSoundsEnabled(!soundsEnabled)}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            soundsEnabled 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          {soundsEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Volume</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'tasks' && (
          <>
            {/* Task Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Your Tasks</h2>
                <div className="flex gap-3">
                <button
                  onClick={addTask}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + Add Task
                </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all data? This will remove all tasks and reset puzzle progress. This action cannot be undone.')) {
                        setTasks([]);
                        setRevealedPieces(0);
                        setCurrentTaskId(undefined);
                        setEditingId(null);
                        setEditingTitle("");
                        setExpandedTasks(new Set());
                      }
                    }}
                    className="bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    title="Clear all tasks and reset puzzle progress"
                  >
                    🗑️ Clear All Data
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {tasks.map((task) => renderTask(task))}
              </div>
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No tasks yet! Click "Add Task" to start growing your garden.</p>
                </div>
              )}
            </div>
          </>
        )}
        


        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>💡 <strong>Tips:</strong> Click on a task title to edit it, click the checkbox to mark as complete/incomplete</p>
          <p className="mt-1">🌿 <strong>Subtasks:</strong> Use the +⊂ button to add nested tasks, click ▼/▶ to expand/collapse</p>
                          <p className="mt-1">🧩 <strong>Puzzle:</strong> Complete tasks to reveal seasonal garden images - each completion reveals a new puzzle piece!</p>
        </div>
      </div>
      
              {/* Beautiful Authentication Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-8 text-center text-white">
                <div className="text-4xl mb-2">🌱</div>
                <h2 className="text-2xl font-bold mb-2">
                  {isSignUp ? "Join Task Garden" : "Welcome Back"}
                </h2>
                <p className="text-emerald-50 text-sm">
                  {isSignUp ? "Create your account and start growing" : "Sign in to continue your journey"}
                </p>
              </div>

              {/* Form section */}
              <div className="p-8">
                <form onSubmit={handleAuth} className="space-y-6">
                  {authError && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{authError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSigningIn ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isSignUp ? "Creating Account..." : "Signing In..."}
                      </div>
                    ) : (
                      isSignUp ? "Create Account" : "Sign In"
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError("");
                        setAuthEmail("");
                        setAuthPassword("");
                      }}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200 hover:underline"
                    >
                      {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowAuth(false)}
                className="absolute top-6 right-6 text-white hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
    </div>
  );
}