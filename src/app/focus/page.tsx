"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Play, Pause, RotateCcw, Bell, Clock, ZapOff, Zap, ListChecks, BellOff, Music, VolumeX } from 'lucide-react';

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
  const [currentTime, setCurrentTime] = useState<string>('');
  // Store remaining time for each timer mode
  const [modeTimeRemaining, setModeTimeRemaining] = useState<{
    short: number;
    long: number;
    break: number;
  }>({
    short: TIMER_DURATIONS.short * 60,
    long: TIMER_DURATIONS.long * 60,
    break: TIMER_DURATIONS.break * 60
  });
  
  // Study music states
  const [isStudyMusicPlaying, setIsStudyMusicPlaying] = useState<boolean>(false);
  const studyMusicRef = useRef<HTMLAudioElement | null>(null);
  
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
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          // Also update the mode-specific time remaining
          setModeTimeRemaining(prev => ({
            ...prev,
            [timerMode]: newTime
          }));
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      localStorage.setItem('focusTimerActive', 'false');
      localStorage.removeItem('focusTimerStartTime');
      
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
        const breakDuration = TIMER_DURATIONS.break * 60;
        setTimeRemaining(breakDuration);
        
        // Reset the break mode time
        setModeTimeRemaining(prev => ({
          ...prev,
          break: breakDuration
        }));
        
        // Update localStorage
        localStorage.setItem('focusTimerMode', 'break');
        localStorage.setItem('focusTimerRemaining', breakDuration.toString());
        localStorage.setItem('focusModeTimeRemaining', JSON.stringify({
          ...modeTimeRemaining,
          break: breakDuration
        }));
      } else {
        // After break is over
        setTimerMode('short');
        const shortDuration = TIMER_DURATIONS.short * 60;
        setTimeRemaining(shortDuration);
        
        // Reset the short mode time
        setModeTimeRemaining(prev => ({
          ...prev,
          short: shortDuration
        }));
        
        // Update localStorage
        localStorage.setItem('focusTimerMode', 'short');
        localStorage.setItem('focusTimerRemaining', shortDuration.toString());
        localStorage.setItem('focusModeTimeRemaining', JSON.stringify({
          ...modeTimeRemaining,
          short: shortDuration
        }));
        
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
  }, [isActive, timeRemaining, timerMode, soundEnabled, modeTimeRemaining]);
  
  // Change timer mode
  const handleTimerModeChange = (mode: 'short' | 'long' | 'break') => {
    // Don't change if it's the same mode
    if (mode === timerMode) return;
    
    // Keep current active state instead of always stopping
    const currentlyActive = isActive;
    
    // Save current timer state for the current mode
    setModeTimeRemaining(prev => ({
      ...prev,
      [timerMode]: timeRemaining
    }));
    
    // Get the saved time for the new mode
    const savedTimeForNewMode = modeTimeRemaining[mode];
    
    setTimerMode(mode);
    setTimeRemaining(savedTimeForNewMode);
    
    // If timer was active, keep it active with the new mode
    if (currentlyActive) {
      // Record new start time
      const now = Date.now();
      
      // Update localStorage with new mode but maintain active state
      localStorage.setItem('focusTimerActive', 'true');
      localStorage.setItem('focusTimerStartTime', now.toString());
      localStorage.setItem('focusTimerMode', mode);
      localStorage.setItem('focusTimerRemaining', savedTimeForNewMode.toString());
      // Also save the mode-specific time remaining
      localStorage.setItem('focusModeTimeRemaining', JSON.stringify(modeTimeRemaining));
    } else {
      // If it wasn't active, clear timer state
      localStorage.setItem('focusTimerActive', 'false');
      localStorage.setItem('focusTimerMode', mode);
      localStorage.setItem('focusTimerRemaining', savedTimeForNewMode.toString());
      localStorage.removeItem('focusTimerStartTime');
      // Also save the mode-specific time remaining
      localStorage.setItem('focusModeTimeRemaining', JSON.stringify(modeTimeRemaining));
    }
  };
  
  // Toggle timer
  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    
    if (newIsActive) {
      // Record the start time when activating the timer
      const now = Date.now();
      // Save timer state to localStorage
      localStorage.setItem('focusTimerStartTime', now.toString());
      localStorage.setItem('focusTimerActive', 'true');
      localStorage.setItem('focusTimerRemaining', timeRemaining.toString());
      localStorage.setItem('focusTimerMode', timerMode);
    } else {
      // Clear timer start time when pausing
      localStorage.setItem('focusTimerActive', 'false');
      localStorage.setItem('focusTimerRemaining', timeRemaining.toString());
    }
  };
  
  // Reset timer
  const resetTimer = () => {
    const newDuration = TIMER_DURATIONS[timerMode] * 60;
    setTimeRemaining(newDuration);
    setIsActive(false);
    
    // Reset the current mode's time remaining
    setModeTimeRemaining(prev => ({
      ...prev,
      [timerMode]: newDuration
    }));
    
    // Update localStorage
    localStorage.setItem('focusTimerActive', 'false');
    localStorage.setItem('focusTimerRemaining', newDuration.toString());
    localStorage.removeItem('focusTimerStartTime');
    // Update mode-specific time remaining in localStorage
    localStorage.setItem('focusModeTimeRemaining', JSON.stringify({
      ...modeTimeRemaining,
      [timerMode]: newDuration
    }));
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
  
  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Initialize and control study music
  useEffect(() => {
    const audio = new Audio('/lofi-background.mp3');
    audio.loop = true;
    audio.volume = 0.74;
    studyMusicRef.current = audio;
    
    return () => {
      if (studyMusicRef.current) {
        studyMusicRef.current.pause();
        studyMusicRef.current = null;
      }
    };
  }, []);
  
  // Toggle study music
  const toggleStudyMusic = () => {
    if (studyMusicRef.current) {
      if (isStudyMusicPlaying) {
        studyMusicRef.current.pause();
      } else {
        studyMusicRef.current.play().catch(err => 
          console.error('Failed to play study music:', err)
        );
      }
      setIsStudyMusicPlaying(!isStudyMusicPlaying);
    }
  };
  
  // Add new todo - with immediate localStorage update
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() !== '') {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      };
      const updatedTodos = [...todos, newItem];
      setTodos(updatedTodos);
      setNewTodo('');
      
      // Immediately save to localStorage
      try {
        localStorage.setItem('focusTodos', JSON.stringify(updatedTodos));
      } catch (error) {
        console.error('Error saving new todo to localStorage:', error);
      }
    }
  };
  
  // Toggle todo completion status - with immediate localStorage update
  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const newStatus = !todo.completed;
        // Update completed tasks count
        setCompletedTasks(prev => newStatus ? prev + 1 : prev - 1);
        return { ...todo, completed: newStatus };
      }
      return todo;
    });
    
    setTodos(updatedTodos);
    
    // Immediately save to localStorage
    try {
      localStorage.setItem('focusTodos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error saving toggled todo to localStorage:', error);
    }
  };
  
  // Delete todo - with immediate localStorage update
  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (todoToDelete && todoToDelete.completed) {
      setCompletedTasks(prev => prev - 1);
    }
    
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    
    // Immediately save to localStorage
    try {
      localStorage.setItem('focusTodos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error saving after deleting todo:', error);
    }
  };
  
  // Clear all completed todos - with immediate localStorage update
  const clearCompletedTodos = () => {
    const updatedTodos = todos.filter(todo => !todo.completed);
    setTodos(updatedTodos);
    setCompletedTasks(0);
    
    // Immediately save to localStorage
    try {
      localStorage.setItem('focusTodos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error saving after clearing completed todos:', error);
    }
  };
  
  // Load data from localStorage on first render - with more robust error handling
  useEffect(() => {
    try {
      console.log("Loading data from localStorage...");
      const savedTodos = localStorage.getItem('focusTodos');
      console.log("Saved todos from localStorage:", savedTodos);
      
      const savedSessionHistory = localStorage.getItem('focusSessionHistory');
      const savedSessionsCompleted = localStorage.getItem('focusSessionsCompleted');
      const savedSoundEnabled = localStorage.getItem('focusSoundEnabled');
      const savedStudyMusicPlaying = localStorage.getItem('focusStudyMusicPlaying');
      
      // Timer persistence
      const savedTimerActive = localStorage.getItem('focusTimerActive');
      const savedTimerRemaining = localStorage.getItem('focusTimerRemaining');
      const savedTimerMode = localStorage.getItem('focusTimerMode');
      const savedTimerStartTime = localStorage.getItem('focusTimerStartTime');
      
      const savedModeTimeRemaining = localStorage.getItem('focusModeTimeRemaining');
      
      if (savedTodos) {
        try {
          const parsedTodos = JSON.parse(savedTodos);
          console.log("Parsed todos:", parsedTodos);
          
          if (Array.isArray(parsedTodos)) {
            setTodos(parsedTodos);
            const completedCount = parsedTodos.filter((todo: TodoItem) => todo.completed).length;
            setCompletedTasks(completedCount);
            console.log(`Successfully loaded ${parsedTodos.length} todos (${completedCount} completed) from localStorage`);
            
            // Test write to localStorage immediately to ensure it works
            const testWrite = JSON.stringify(parsedTodos);
            localStorage.setItem('focusTodosTest', testWrite);
            const readBack = localStorage.getItem('focusTodosTest');
            if (readBack !== testWrite) {
              console.error("localStorage write/read verification failed!");
            } else {
              console.log("localStorage write/read verification successful");
            }
          } else {
            console.warn('Saved todos not in expected format (not an array), resetting');
            setTodos([]);
            setCompletedTasks(0);
          }
        } catch (parseError) {
          console.error('Error parsing saved todos:', parseError);
          setTodos([]);
          setCompletedTasks(0);
        }
      } else {
        console.log("No saved todos found in localStorage");
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
      
      if (savedStudyMusicPlaying) {
        const isPlaying = JSON.parse(savedStudyMusicPlaying);
        setIsStudyMusicPlaying(isPlaying);
        if (isPlaying && studyMusicRef.current) {
          studyMusicRef.current.play().catch(() => {
            // Auto-play might be blocked, we'll reset the state
            setIsStudyMusicPlaying(false);
          });
        }
      }
      
      // Restore timer state
      if (savedTimerMode && (savedTimerMode === 'short' || savedTimerMode === 'long' || savedTimerMode === 'break')) {
        setTimerMode(savedTimerMode as 'short' | 'long' | 'break');
      }
      
      if (savedTimerRemaining) {
        let remaining = parseInt(savedTimerRemaining);
        
        // If timer was active, calculate elapsed time since it was started
        if (savedTimerActive === 'true' && savedTimerStartTime) {
          const startTime = parseInt(savedTimerStartTime);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - startTime) / 1000);
          
          // Adjust remaining time
          remaining = Math.max(0, remaining - elapsedSeconds);
          
          // If timer should have completed while away
          if (remaining <= 0) {
            // Reset to beginning of next phase
            if (savedTimerMode === 'break') {
              setTimerMode('short');
              remaining = TIMER_DURATIONS.short * 60;
              localStorage.setItem('focusTimerMode', 'short');
            } else {
              // After work session, go to break
              setTimerMode('break');
              remaining = TIMER_DURATIONS.break * 60;
              localStorage.setItem('focusTimerMode', 'break');
              
              // Count completed session
              if (savedTimerMode !== 'break') {
                setSessionsCompleted(prev => prev + 1);
                // Add to session history
                const newSession: FocusSession = {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  duration: TIMER_DURATIONS[savedTimerMode as 'short' | 'long'],
                  completed: true
                };
                setSessionHistory(prev => [newSession, ...prev]);
              }
            }
            
            // Timer completed, so it's no longer active
            setIsActive(false);
            localStorage.setItem('focusTimerActive', 'false');
            localStorage.removeItem('focusTimerStartTime');
          } else {
            // Timer still has time, resume it
            setIsActive(true);
          }
        } else {
          setIsActive(false);
        }
        
        // Set the remaining time
        setTimeRemaining(remaining);
        localStorage.setItem('focusTimerRemaining', remaining.toString());
      }
      
      if (savedModeTimeRemaining) {
        setModeTimeRemaining(JSON.parse(savedModeTimeRemaining));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);
  
  // Save data to localStorage when they change - with more robust implementation
  useEffect(() => {
    try {
      console.log(`Saving ${todos.length} todos to localStorage`);
      
      // Save todos with error handling
      const todosJson = JSON.stringify(todos);
      localStorage.setItem('focusTodos', todosJson);
      
      // Verify the save by reading back
      const savedBack = localStorage.getItem('focusTodos');
      if (savedBack !== todosJson) {
        console.error("Todos may not have saved correctly - verification failed");
      }
      
      // Save other data
      localStorage.setItem('focusSessionHistory', JSON.stringify(sessionHistory));
      localStorage.setItem('focusSessionsCompleted', sessionsCompleted.toString());
      localStorage.setItem('focusSoundEnabled', JSON.stringify(soundEnabled));
      localStorage.setItem('focusStudyMusicPlaying', JSON.stringify(isStudyMusicPlaying));
      
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [todos, sessionHistory, sessionsCompleted, soundEnabled, isStudyMusicPlaying]);
  
  // Check localStorage availability on mount
  useEffect(() => {
    try {
      // Test if localStorage is working properly
      const testKey = 'focusLocalStorageTest';
      localStorage.setItem(testKey, 'test');
      if (localStorage.getItem(testKey) !== 'test') {
        console.error('localStorage is not working properly');
        alert('Warning: Your browser storage seems to be disabled or not working properly. Your tasks may not be saved between sessions.');
      } else {
        localStorage.removeItem(testKey);
        console.log('localStorage is working properly');
      }
    } catch (error) {
      console.error('localStorage not available:', error);
      alert('Warning: Your browser has localStorage disabled. Tasks will not be saved between sessions.');
    }
  }, []);
  
  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    };
    
    // Update immediately, then every second
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);
  
  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center">
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
            onClick={toggleStudyMusic}
            className={`text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 ${
              isStudyMusicPlaying ? 'text-amber-500 dark:text-amber-400' : ''
            }`}
            aria-label={isStudyMusicPlaying ? "Pause study music" : "Play study music"}
          >
            {isStudyMusicPlaying ? <Music size={18} /> : <VolumeX size={18} />}
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
          {/* Timer mode tabs and info bar */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-2">
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
            
            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Zap size={16} className="text-amber-500" />
                <span>{sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="h-3.5 border-l border-zinc-300 dark:border-zinc-600"></div>
              
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-zinc-500" />
                <span className="font-medium tabular-nums">{currentTime}</span>
              </div>
            </div>
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