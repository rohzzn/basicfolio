"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, ArrowLeft, Play, Pause, RotateCcw, Bell, Clock, ZapOff, Zap, ListChecks, BellOff } from 'lucide-react';
import Link from 'next/link';

// Type for todo items
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// Type for session history
interface FocusSession {
  id: string;
  date: string;
  duration: number;
  completed: boolean;
}

// Pomodoro timer durations in minutes
const TIMER_DURATIONS = {
  short: 25,
  long: 50,
  break: 5
};

const FocusPage: React.FC = () => {
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState<number>(TIMER_DURATIONS.short * 60); // Default to 25 minutes in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'short' | 'long' | 'break'>('short');
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [showSessionHistory, setShowSessionHistory] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  
  // Todo states
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  
  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate progress
  useEffect(() => {
    const totalSeconds = TIMER_DURATIONS[timerMode] * 60;
    const elapsedSeconds = totalSeconds - timeRemaining;
    const currentProgress = (elapsedSeconds / totalSeconds) * 100;
    setProgress(currentProgress);
  }, [timeRemaining, timerMode]);
  
  // Effect to handle timer countdown
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      
      // Handle session completion
      if (timerMode !== 'break') {
        // Only count non-break sessions
        setSessionsCompleted(prev => prev + 1);
        
        // Add to session history
        const newSession: FocusSession = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          duration: TIMER_DURATIONS[timerMode],
          completed: true
        };
        setSessionHistory(prev => [newSession, ...prev]);
        
        // Play sound when timer ends
        if (soundEnabled) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(err => console.error('Failed to play notification sound:', err));
        }
        
        // Automatically switch to break mode
        setTimerMode('break');
        setTimeRemaining(TIMER_DURATIONS.break * 60);
      } else {
        // After break is over
        setTimerMode('short');
        setTimeRemaining(TIMER_DURATIONS.short * 60);
        
        // Play different sound for break end
        if (soundEnabled) {
          const audio = new Audio('/break-end.mp3');
          audio.play().catch(err => console.error('Failed to play notification sound:', err));
        }
      }
    }
    
    // Cleanup interval on unmount or when timer stops
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeRemaining, timerMode, soundEnabled]);
  
  // Change timer mode
  const handleTimerModeChange = (mode: 'short' | 'long' | 'break') => {
    setTimerMode(mode);
    setTimeRemaining(TIMER_DURATIONS[mode] * 60);
    setIsActive(false);
  };
  
  // Toggle timer
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  // Reset timer
  const resetTimer = () => {
    setTimeRemaining(TIMER_DURATIONS[timerMode] * 60);
    setIsActive(false);
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date for session history
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Add new todo
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() !== '') {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      };
      setTodos([...todos, newItem]);
      setNewTodo('');
    }
  };
  
  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const newStatus = !todo.completed;
        // Update completed tasks count
        setCompletedTasks(prev => newStatus ? prev + 1 : prev - 1);
        return { ...todo, completed: newStatus };
      }
      return todo;
    }));
  };
  
  // Delete todo
  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (todoToDelete && todoToDelete.completed) {
      setCompletedTasks(prev => prev - 1);
    }
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // Clear all completed todos
  const clearCompletedTodos = () => {
    setTodos(todos.filter(todo => !todo.completed));
    setCompletedTasks(0);
  };
  
  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Load data from localStorage on first render
  useEffect(() => {
    const savedTodos = localStorage.getItem('focusTodos');
    const savedSessionHistory = localStorage.getItem('focusSessionHistory');
    const savedSessionsCompleted = localStorage.getItem('focusSessionsCompleted');
    const savedSoundEnabled = localStorage.getItem('focusSoundEnabled');
    
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      setTodos(parsedTodos);
      setCompletedTasks(parsedTodos.filter((todo: TodoItem) => todo.completed).length);
    }
    
    if (savedSessionHistory) {
      setSessionHistory(JSON.parse(savedSessionHistory));
    }
    
    if (savedSessionsCompleted) {
      setSessionsCompleted(parseInt(savedSessionsCompleted));
    }
    
    if (savedSoundEnabled) {
      setSoundEnabled(JSON.parse(savedSoundEnabled));
    }
  }, []);
  
  // Save data to localStorage when they change
  useEffect(() => {
    localStorage.setItem('focusTodos', JSON.stringify(todos));
    localStorage.setItem('focusSessionHistory', JSON.stringify(sessionHistory));
    localStorage.setItem('focusSessionsCompleted', sessionsCompleted.toString());
    localStorage.setItem('focusSoundEnabled', JSON.stringify(soundEnabled));
  }, [todos, sessionHistory, sessionsCompleted, soundEnabled]);
  
  return (
    <div className="max-w-7xl">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <Link href="/" className="mr-4 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg sm:text-xl font-medium dark:text-white">Focus Mode</h1>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <button
            onClick={() => setShowSessionHistory(!showSessionHistory)}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            aria-label="Session history"
          >
            <ListChecks size={18} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-6 relative">
          {/* Session counter */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <Zap size={16} className="text-amber-500" />
            <span>{sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''}</span>
          </div>
          
          {/* Timer mode tabs */}
          <div className="mb-6 flex gap-2">
            <button 
              onClick={() => handleTimerModeChange('short')}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                timerMode === 'short' 
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>25 min</span>
              </div>
            </button>
            <button 
              onClick={() => handleTimerModeChange('long')}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                timerMode === 'long' 
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>50 min</span>
              </div>
            </button>
            <button 
              onClick={() => handleTimerModeChange('break')}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                timerMode === 'break' 
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ZapOff size={16} />
                <span>Break</span>
              </div>
            </button>
          </div>
          
          <div className="mb-8 relative w-full h-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full ${
                timerMode === 'break' ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-7xl md:text-8xl font-bold tracking-tight tabular-nums dark:text-white mb-8">
              {formatTime(timeRemaining)}
            </div>
            
            <div className="flex justify-center space-x-6">
              <button 
                onClick={toggleTimer}
                className="p-5 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors transform hover:scale-105 active:scale-95"
              >
                {isActive ? <Pause size={28} strokeWidth={2.5} /> : <Play size={28} strokeWidth={2.5} />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-5 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors transform hover:scale-105 active:scale-95"
              >
                <RotateCcw size={28} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-6">
              {isActive ? (
                <p>
                  {timerMode === 'break' 
                    ? "Taking a break..." 
                    : "Focus time! Get things done."}
                </p>
              ) : (
                <p>Press play to start your {timerMode} session</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Todo Section or Session History */}
        <div className="lg:col-span-5">
          {showSessionHistory ? (
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium dark:text-white">Session History</h2>
                <button 
                  onClick={() => setShowSessionHistory(false)}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  Show todo list
                </button>
              </div>
              
              {sessionHistory.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-center py-4 text-sm">No sessions completed yet. Start your first focus session!</p>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto">
                  {sessionHistory.map(session => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-700/60 p-3 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-zinc-200 dark:bg-zinc-600 rounded-full p-1.5">
                          <Clock size={16} className="text-zinc-700 dark:text-zinc-300" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-800 dark:text-zinc-200">
                            {session.duration} minute session
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatDate(session.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium dark:text-white">Today&apos;s Tasks</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={clearCompletedTodos}
                    className={`text-xs ${todos.some(t => t.completed) 
                      ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200' 
                      : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'}`}
                    disabled={!todos.some(t => t.completed)}
                  >
                    Clear completed
                  </button>
                  <button 
                    onClick={() => setShowSessionHistory(true)}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    Show history
                  </button>
                </div>
              </div>
              
              <form onSubmit={addTodo} className="mb-4">
                <div className="flex">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a task..."
                    className="flex-1 bg-zinc-100 dark:bg-zinc-700 border-0 rounded-l-md py-2 px-4 text-zinc-800 dark:text-zinc-200 text-sm placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 outline-none"
                  />
                  <button 
                    type="submit"
                    className="bg-zinc-200 dark:bg-zinc-600 rounded-r-md py-2 px-4 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
              </form>
              
              {/* Task progress */}
              {todos.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    <span>{completedTasks} of {todos.length} completed</span>
                    <span>{Math.round((completedTasks / todos.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 dark:bg-emerald-400"
                      style={{ width: `${(completedTasks / todos.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {todos.length === 0 ? (
                  <p className="text-zinc-500 dark:text-zinc-400 text-center py-4 text-sm">No tasks yet. Add some to get started!</p>
                ) : (
                  todos.map(todo => (
                    <div 
                      key={todo.id} 
                      className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-700/60 p-3 rounded-md"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleTodo(todo.id)} 
                          className={`flex-shrink-0 ${todo.completed 
                            ? 'text-emerald-500 dark:text-emerald-400' 
                            : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                          {todo.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <span 
                          className={`truncate ${todo.completed 
                            ? 'line-through text-zinc-400 dark:text-zinc-500' 
                            : 'text-zinc-800 dark:text-zinc-200'}`}
                        >
                          {todo.text}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="flex-shrink-0 ml-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusPage; 