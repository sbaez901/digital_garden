import React, { useState, useMemo, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  subtasks: Task[];
  pomodoros?: number; // Track completed pomodoros for this task
}

export default function DigitalGardenApp() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Design database schema", status: "todo", subtasks: [] },
    { id: "2", title: "Implement API endpoints", status: "todo", subtasks: [] },
    { id: "3", title: "Create frontend components", status: "todo", subtasks: [] },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // Pomodoro Timer State
  const [timerState, setTimerState] = useState<'work' | 'shortBreak' | 'longBreak' | 'idle'>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(undefined);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Tab Interface State
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'tasks'>('pomodoro');

  // Calculate garden stats
  const gardenStats = useMemo(() => {
    const totalTasks = tasks.length + tasks.reduce((sum, task) => sum + task.subtasks.length, 0);
    const completedTasks = tasks.filter(t => t.status === 'done').length + 
                          tasks.reduce((sum, task) => sum + task.subtasks.filter(st => st.status === 'done').length, 0);
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length + 
                           tasks.reduce((sum, task) => sum + task.subtasks.filter(st => st.status === 'in-progress').length, 0);
    
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const healthScore = totalTasks > 0 ? (completedTasks * 0.6 + inProgressTasks * 0.3) / totalTasks : 0;
    
    return { totalTasks, completedTasks, inProgressTasks, completionRate, healthScore };
  }, [tasks]);

  // Generate garden elements based on progress
  const gardenElements = useMemo(() => {
    const elements = [];
    const { completedTasks, inProgressTasks, totalTasks } = gardenStats;
    
    // Add completed flowers (blooming) with more variety
    for (let i = 0; i < completedTasks; i++) {
      const flowerTypes = ['🌻', '🌹', '🌷', '🌸', '🌺', '🌼', '🌻', '🌹', '🌷', '🌸'];
      const sizes = ['large', 'medium', 'large', 'medium', 'large'];
      elements.push({
        id: `flower-${i}`,
        type: 'flower',
        emoji: flowerTypes[i % flowerTypes.length],
        x: 15 + (i % 6) * 55 + Math.random() * 20,
        y: 15 + Math.floor(i / 6) * 65 + Math.random() * 15,
        size: sizes[i % sizes.length],
        status: 'blooming',
        animation: i % 3 === 0 ? 'bounce' : i % 3 === 1 ? 'pulse' : 'none'
      });
    }
    
    // Add in-progress buds (growing) with staggered positioning
    for (let i = 0; i < inProgressTasks; i++) {
      elements.push({
        id: `bud-${i}`,
        type: 'bud',
        emoji: ['🌱', '🌿', '🌱', '🌿'][i % 4],
        x: 45 + (i % 5) * 65 + Math.random() * 25,
        y: 130 + Math.floor(i / 5) * 55 + Math.random() * 20,
        size: 'medium',
        status: 'growing',
        animation: 'bounce'
      });
    }
    
    // Add todo seeds (planted) with natural distribution
    const todoCount = totalTasks - completedTasks - inProgressTasks;
    for (let i = 0; i < Math.min(todoCount, 10); i++) {
      elements.push({
        id: `seed-${i}`,
        type: 'seed',
        emoji: ['🌱', '🌿', '🌱', '🌿', '🌱'][i % 5],
        x: 70 + (i % 5) * 75 + Math.random() * 30,
        y: 210 + Math.floor(i / 5) * 45 + Math.random() * 25,
        size: 'small',
        status: 'planted',
        animation: 'none'
      });
    }
    
    // Add decorative elements with progressive unlocking
    if (completedTasks > 0) {
      elements.push({ 
        id: 'butterfly', 
        type: 'decoration', 
        emoji: '🦋', 
        x: 290 + Math.random() * 20, 
        y: 45 + Math.random() * 20, 
        size: 'medium', 
        status: 'active',
        animation: 'bounce'
      });
    }
    if (completedTasks > 2) {
      elements.push({ 
        id: 'bee', 
        type: 'decoration', 
        emoji: '🐝', 
        x: 330 + Math.random() * 15, 
        y: 75 + Math.random() * 15, 
        size: 'small', 
        status: 'active',
        animation: 'bounce'
      });
    }
    if (completedTasks > 4) {
      elements.push({ 
        id: 'sun', 
        type: 'decoration', 
        emoji: '☀️', 
        x: 360 + Math.random() * 10, 
        y: 15 + Math.random() * 10, 
        size: 'large', 
        status: 'active',
        animation: 'pulse'
      });
    }
    if (completedTasks > 6) {
      elements.push({ 
        id: 'rainbow', 
        type: 'decoration', 
        emoji: '🌈', 
        x: 50 + Math.random() * 20, 
        y: 280 + Math.random() * 15, 
        size: 'medium', 
        status: 'active',
        animation: 'pulse'
      });
    }
    if (completedTasks > 8) {
      elements.push({ 
        id: 'star', 
        type: 'decoration', 
        emoji: '⭐', 
        x: 320 + Math.random() * 15, 
        y: 120 + Math.random() * 15, 
        size: 'small', 
        status: 'active',
        animation: 'pulse'
      });
    }
    
    return elements;
  }, [gardenStats]);

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

  // Function to complete tasks from Pomodoro view
  const completeTaskFromPomodoro = (taskId: string) => {
    setTasks(tasks.map(task => {
      // Check if current task is a main task
      if (task.id === taskId) {
        playSound('task-complete');
        return { ...task, status: 'done' };
      }
      // Check if current task is a subtask
      if (task.subtasks.some(subtask => subtask.id === taskId)) {
        playSound('task-complete');
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
    let interval: number;
    
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
      title: "New Subtask",
      status: "todo",
      subtasks: []
    };
    
    setTasks(tasks.map(task => 
      task.id === parentId 
        ? { ...task, subtasks: [...task.subtasks, newSubtask] }
        : task
    ));
    
    setExpandedTasks(prev => new Set([...prev, parentId]));
  };

  const toggleStatus = (id: string, parentId?: string) => {
    setTasks(tasks.map(task => {
      if (parentId) {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === id
                ? { ...subtask, status: subtask.status === 'todo' ? 'in-progress' : subtask.status === 'in-progress' ? 'done' : 'todo' }
                : subtask
            )
          };
        }
        return task;
      } else {
        if (task.id === id) {
          return { ...task, status: task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo' };
        }
        return task;
      }
    }));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = () => {
    if (editingId && editingTitle.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingId 
          ? { ...task, title: editingTitle.trim() }
          : task
      ));
    }
    setEditingId(null);
    setEditingTitle("");
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
                className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                autoFocus
              />
            ) : (
              <span 
                className="text-gray-800 font-medium cursor-pointer hover:text-emerald-700"
                onClick={() => startEditing(task)}
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
            <span 
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                task.status === 'done' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`} 
              onClick={() => toggleStatus(task.id, parentId)}
            >
              {task.status}
            </span>
            
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
        
        {/* Garden Visualization - Always Visible */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">🌿 Your Growing Garden</h2>
          
          {/* Time-based Welcome Message */}
          <div className="text-center mb-4">
            <p className={`text-sm ${timeTheme.textColor} font-medium`}>
              {timeTheme.message}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Garden Canvas */}
            <div className={`relative bg-gradient-to-b ${timeTheme.bgGradient} rounded-lg p-4 h-80 overflow-hidden transition-all duration-1000`}>
              {/* Time Indicator */}
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{timeTheme.icon}</span>
                  <span className={`font-medium ${timeTheme.textColor}`}>{timeOfDay}</span>
                </div>
              </div>
              
              {/* Enhanced Background with Waves */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30"></div>
              
              {/* Animated Waves at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
                <div className="wave-container">
                  <div className="wave wave1"></div>
                  <div className="wave wave2"></div>
                  <div className="wave wave3"></div>
                </div>
              </div>
              
              {/* Floating Particles */}
              <div className="particles-container">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={`particle-${i}`}
                    className="particle"
                    style={{
                      '--delay': `${i * 0.5}s`,
                      '--duration': `${3 + i * 0.2}s`,
                      '--x': `${20 + (i * 25) % 300}px`,
                      '--y': `${50 + (i * 30) % 200}px`
                    } as React.CSSProperties}
                  ></div>
                ))}
              </div>
              
              {/* Garden Elements with Enhanced Effects */}
              {gardenElements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute transition-all duration-1000 ease-out ${
                    element.size === 'large' ? 'text-4xl' : 
                    element.size === 'medium' ? 'text-3xl' : 'text-2xl'
                  } ${
                    element.animation === 'bounce' ? 'animate-bounce' : 
                    element.animation === 'pulse' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    transform: `scale(${element.status === 'blooming' ? 1.1 : 1})`,
                    filter: element.status === 'blooming' ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))' : 'none'
                  }}
                >
                  {element.emoji}
                  
                  {/* Rainbow Trail for Butterflies and Bees */}
                  {element.type === 'decoration' && (
                    <div className="rainbow-trail"></div>
                  )}
                  
                  {/* Glow Effect for Blooming Flowers */}
                  {element.status === 'blooming' && (
                    <div className="flower-glow"></div>
                  )}
                </div>
              ))}
              
              {/* Floating Leaves */}
              <div className="floating-leaves">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`leaf-${i}`}
                    className="floating-leaf"
                    style={{
                      '--delay': `${i * 0.8}s`,
                      '--duration': `${4 + i * 0.5}s`,
                      '--x': `${30 + (i * 40) % 280}px`,
                      '--y': `${60 + (i * 25) % 180}px`
                    } as React.CSSProperties}
                  >
                    🍃
                  </div>
                ))}
              </div>
              
              {/* Achievement Sparks */}
              {gardenStats.completionRate > 0.5 && (
                <div className="achievement-sparks">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`spark-${i}`}
                      className="achievement-spark"
                      style={{
                        '--delay': `${i * 0.3}s`,
                        '--x': `${150 + Math.cos(i * 1.2) * 100}px`,
                        '--y': `${100 + Math.sin(i * 1.2) * 80}px`
                      } as React.CSSProperties}
                    >
                      ✨
                    </div>
                  ))}
                </div>
              )}
              
              {/* Garden Stats Overlay */}
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{Math.round(gardenStats.completionRate * 100)}%</div>
                  <div className="text-gray-600">Complete</div>
                </div>
              </div>
            </div>
            
            {/* Garden Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-100 rounded-lg p-4 text-center transform hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl font-bold text-green-600">{gardenStats.completedTasks}</div>
                  <div className="text-sm text-green-700">Blooming Flowers</div>
                </div>
                <div className="bg-blue-100 rounded-lg p-4 text-center transform hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl font-bold text-blue-600">{gardenStats.inProgressTasks}</div>
                  <div className="text-sm text-blue-700">Growing Buds</div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 text-center transform hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl font-bold text-yellow-600">{gardenStats.totalTasks}</div>
                  <div className="text-sm text-yellow-700">Total Plants</div>
                </div>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">🌱 Garden Health</h3>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-3 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${Math.round(gardenStats.healthScore * 100)}%` }}
                  >
                    {/* Shimmer Effect on Health Bar */}
                    <div className="shimmer-effect"></div>
                  </div>
                </div>
                <div className="text-sm text-emerald-700 mt-2">
                  {gardenStats.healthScore > 0.8 ? '🌺 Garden is thriving!' :
                   gardenStats.healthScore > 0.5 ? '🌿 Garden is growing well!' :
                   gardenStats.healthScore > 0.2 ? '🌱 Garden needs attention' :
                   '🌱 Time to plant some seeds!'}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>💡 <strong>Tip:</strong> Complete tasks to see your garden bloom! Each completed task becomes a beautiful flower.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation - Only for Pomodoro and Tasks */}
        <div className="bg-white rounded-lg shadow-lg p-2 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'pomodoro'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🍅 Pomodoro Timer
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📝 Task Management
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
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${timerState === 'work' ? 'from-emerald-400 to-emerald-500' : timerState === 'shortBreak' ? 'from-green-400 to-green-500' : timerState === 'longBreak' ? 'from-blue-400 to-blue-500' : 'from-gray-400 to-gray-500'} text-white mb-4 transition-all duration-500 shadow-lg`}>
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
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
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
                                <span className="text-sm text-emerald-600">
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
                                    <span className="text-sm text-emerald-600">
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
                                <span className="text-emerald-600 text-xs">
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
                                  <span className="text-emerald-600 text-xs">
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
                      <div className="text-2xl font-bold text-emerald-600">{completedPomodoros}</div>
                      <div className="text-sm text-emerald-700">Pomodoros</div>
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
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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
                <button
                  onClick={addTask}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + Add Task
                </button>
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
          <p>💡 <strong>Tips:</strong> Click on a task title to edit it, click the status to cycle through (todo → in-progress → done)</p>
          <p className="mt-1">🌿 <strong>Subtasks:</strong> Use the +⊂ button to add nested tasks, click ▼/▶ to expand/collapse</p>
          <p className="mt-1">🌸 <strong>Garden:</strong> Watch your garden grow as you complete tasks - each completion adds a new flower!</p>
        </div>
      </div>
    </div>
  );
}