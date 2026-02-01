import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  Plus,
  X,
  Clock,
  TrendingUp,
  Calendar,
  Target,
  Bell,
  BellOff,
  Sun,
  Moon
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

type Habit = {
  id: number;
  name: string;
  category: string;
  streak: number;
  completedDates: Record<string, boolean>;
};

type Task = {
  id: number;
  name: string;
  completed: boolean;
  priority: string;
  dueDate: string;
};

type Reminder = {
  id: number;
  text: string;
  time: string;
  enabled: boolean;
};
const HABITS_KEY = "habit-tracker-habits";
const TASKS_KEY = "habit-tracker-tasks";
const REMINDERS_KEY = "habit-tracker-reminders";
const THEME_KEY = "habit-tracker-theme";

// Tab color configurations
const tabColors: Record<string, { active: string; bg: string; text: string; border: string }> = {
  dashboard: {
    active: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500'
  },
  habits: {
    active: 'bg-gradient-to-r from-purple-500 to-purple-600',
    bg: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500'
  },
  tasks: {
    active: 'bg-gradient-to-r from-blue-500 to-blue-600',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500'
  },
  reminders: {
    active: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500'
  },
  progress: {
    active: 'bg-gradient-to-r from-orange-500 to-orange-600',
    bg: 'hover:bg-orange-50 dark:hover:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500'
  }
};

const HabitTaskTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored ? stored === 'dark' : false;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
      } else {
        alert('Notifications are blocked. Please enable them in your browser settings.');
      }
    }
  };

  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = localStorage.getItem(HABITS_KEY);
    return stored
      ? JSON.parse(stored)
      : [
        { id: 1, name: "Morning Exercise", category: "Health", streak: 7, completedDates: {} },
        { id: 2, name: "Read 30 minutes", category: "Learning", streak: 5, completedDates: {} },
        { id: 3, name: "Meditate", category: "Wellness", streak: 3, completedDates: {} }
      ];
  });


  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored
      ? JSON.parse(stored)
      : [
        { id: 1, name: "Complete project proposal", completed: false, priority: "high", dueDate: "2026-01-13" },
        { id: 2, name: "Call dentist", completed: false, priority: "medium", dueDate: "2026-01-12" }
      ];
  });


  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored
      ? JSON.parse(stored)
      : [
        { id: 1, text: "Morning Exercise", time: "07:00", enabled: true },
        { id: 2, text: "Evening Reading", time: "20:00", enabled: true }
      ];
  });



  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }, [reminders]);

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'Health' });
  const [newTask, setNewTask] = useState({ name: '', priority: 'medium', dueDate: '' });
  const [newReminder, setNewReminder] = useState({ text: '', time: '09:00' });

  const today = new Date().toISOString().split('T')[0];

  const toggleHabit = (habitId: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletedDates = { ...habit.completedDates };
        const isCompleted = newCompletedDates[today];

        if (isCompleted) {
          delete newCompletedDates[today];
          return { ...habit, completedDates: newCompletedDates, streak: Math.max(0, habit.streak - 1) };
        } else {
          newCompletedDates[today] = true;
          return { ...habit, completedDates: newCompletedDates, streak: habit.streak + 1 };
        }
      }
      return habit;
    }));
  };

  const toggleTask = (taskId: number) => {

    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addHabit = () => {
    if (newHabit.name.trim()) {
      setHabits([...habits, {
        id: Date.now(),
        name: newHabit.name,
        category: newHabit.category,
        streak: 0,
        completedDates: {}
      }]);
      setNewHabit({ name: '', category: 'Health' });
      setShowAddHabit(false);
    }
  };

  const addTask = () => {
    if (newTask.name.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        name: newTask.name,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        completed: false
      }]);
      setNewTask({ name: '', priority: 'medium', dueDate: '' });
      setShowAddTask(false);
    }
  };

  const addReminder = () => {
    if (newReminder.text.trim()) {
      setReminders([...reminders, {
        id: Date.now(),
        text: newReminder.text,
        time: newReminder.time,
        enabled: true
      }]);
      setNewReminder({ text: '', time: '09:00' });
      setShowAddReminder(false);
    }
  };

  const deleteHabit = (id: number) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  // Generate chart data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const getProgressData = () => {
    const last7Days = getLast7Days();
    return last7Days.map(date => {
      const completed = habits.filter(h => h.completedDates[date]).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        total: habits.length
      };
    });
  };

  const getStreakData = () => {
    return habits.map(h => ({
      name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
      streak: h.streak
    }));
  };

  const todayCompletion = habits.filter(h => h.completedDates[today]).length;
  const completionRate = habits.length > 0 ? Math.round((todayCompletion / habits.length) * 100) : 0;
  const activeTasks = tasks.filter(t => !t.completed).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-slate-900' : 'bg-gradient-to-br from-indigo-50 to-blue-50'} p-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`rounded-lg shadow-md p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Habit & Task Tracker</h1>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Build better habits, accomplish more tasks</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-sm hover:shadow-md ${darkMode
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                  : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900'
                  }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {/* Notification Toggle */}
              <button
                onClick={toggleNotifications}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md ${notificationsEnabled
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  : darkMode
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 hover:from-gray-500 hover:to-gray-600'
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 hover:from-gray-300 hover:to-gray-400'
                  }`}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell size={18} className="animate-pulse" />
                    <span className="hidden sm:inline">On</span>
                  </>
                ) : (
                  <>
                    <BellOff size={18} />
                    <span className="hidden sm:inline">Off</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`rounded-lg shadow-md mb-6 p-2 flex gap-2 overflow-x-auto transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {['dashboard', 'habits', 'tasks', 'reminders', 'progress'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-md text-sm md:text-base font-medium transition-all duration-200 ${activeTab === tab
                ? `${tabColors[tab].active} text-white shadow-md`
                : `${darkMode ? 'text-gray-300' : 'text-gray-600'} ${tabColors[tab].bg}`
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">


            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today's Progress</p>
                    <p className="text-2xl md:text-3xl font-bold text-indigo-500">{completionRate}%</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{todayCompletion}/{habits.length} habits</p>
                  </div>
                  <Target className="text-indigo-500" size={40} />
                </div>
              </div>

              <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Tasks</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-500">{activeTasks}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{tasks.length} total</p>
                  </div>
                  <Calendar className="text-blue-500" size={40} />
                </div>
              </div>

              <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Reminders</p>
                    <p className="text-2xl md:text-3xl font-bold text-emerald-500">{reminders.filter(r => r.enabled).length}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{reminders.length} total</p>
                  </div>
                  <Bell className="text-emerald-500" size={40} />
                </div>
              </div>
            </div>

            {/* Today's Habits */}
            <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Today's Habits</h2>
              <div className="space-y-4 md:space-y-3">
                {habits.slice(0, 5).map(habit => (
                  <div key={habit.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className="p-2 active:scale-95"
                      >
                        {habit.completedDates[today] ? (
                          <CheckCircle className="text-green-500" size={28} />
                        ) : (
                          <Circle className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={28} />
                        )}
                      </button>


                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{habit.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{habit.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-500">{habit.streak} day streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Upcoming Tasks</h2>
              <div className="space-y-4 md:space-y-3">
                {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="p-2 active:scale-95"
                      >
                        <Circle className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={28} />
                      </button>

                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{task.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Due: {task.dueDate || 'No date'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.priority === 'high'
                      ? darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
                      : task.priority === 'medium'
                        ? darkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                        : darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Daily Habits</h2>
              <button
                onClick={() => setShowAddHabit(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
              >
                <Plus size={20} /> Add Habit
              </button>
            </div>

            {showAddHabit && (
              <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <input
                  type="text"
                  placeholder="Habit name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className={`w-full p-2 border rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                  className={`w-full p-2 border rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Social">Social</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={addHabit} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                    Save
                  </button>
                  <button onClick={() => setShowAddHabit(false)} className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 md:space-y-3">
              {habits.map(habit => (
                <div key={habit.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="p-2 active:scale-95"
                    >
                      {habit.completedDates[today] ? (
                        <CheckCircle className="text-green-500" size={28} />
                      ) : (
                        <Circle className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={28} />
                      )}
                    </button>

                    <div className="flex-1">
                      <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{habit.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{habit.category} • <span className="text-purple-500">{habit.streak} day streak</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-red-500 hover:text-red-400 active:scale-95"
                  >
                    <X size={20} />
                  </button>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tasks</h2>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <Plus size={20} /> Add Task
              </button>
            </div>

            {showAddTask && (
              <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <input
                  type="text"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className={`w-full p-2 border rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className={`w-full p-2 border rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className={`w-full p-2 border rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                />
                <div className="flex gap-2">
                  <button onClick={addTask} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                    Save
                  </button>
                  <button onClick={() => setShowAddTask(false)} className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Active</h3>
                <div className="space-y-4 md:space-y-3">
                  {tasks.filter(t => !t.completed).map(task => (
                    <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="p-2 active:scale-95"
                        >
                          <Circle className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={28} />
                        </button>

                        <div className="flex-1">
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{task.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Due: {task.dueDate || 'No date set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.priority === 'high'
                          ? darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                            ? darkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                            : darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                          }`}>
                          {task.priority}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-red-500 hover:text-red-400 active:scale-95"
                        >
                          <X size={20} />
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {tasks.filter(t => t.completed).length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completed</h3>
                  <div className="space-y-4 md:space-y-3">
                    {tasks.filter(t => t.completed).map(task => (
                      <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg opacity-75 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="p-2 active:scale-95"
                          >
                            <CheckCircle className="text-green-500" size={28} />
                          </button>

                          <div className="flex-1">
                            <p className={`font-medium line-through ${darkMode ? 'text-gray-400' : 'text-gray-800'}`}>{task.name}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Completed</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-red-500 hover:text-red-400 active:scale-95"
                        >
                          <X size={20} />
                        </button>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Reminders</h2>
              <button
                onClick={() => setShowAddReminder(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
              >
                <Plus size={20} /> Add Reminder
              </button>
            </div>

            {showAddReminder && (
              <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <input
                  type="text"
                  placeholder="Reminder text"
                  value={newReminder.text}
                  onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                  className={`w-full p-2 border rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className={`w-full p-2 border rounded-lg mb-3 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                />
                <div className="flex gap-2">
                  <button onClick={addReminder} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                    Save
                  </button>
                  <button onClick={() => setShowAddReminder(false)} className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 md:space-y-3">
              {reminders.map(reminder => (
                <div key={reminder.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <Clock className={reminder.enabled ? 'text-emerald-500' : darkMode ? 'text-gray-500' : 'text-gray-400'} size={28} />
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reminder.text}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{reminder.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${reminder.enabled
                        ? darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-green-100 text-green-700'
                        : darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {reminder.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 text-red-500 hover:text-red-400 active:scale-95"
                    >
                      <X size={20} />
                    </button>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl md:text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <TrendingUp className="text-orange-500" /> Weekly Progress
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getProgressData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#f97316" strokeWidth={2} name="Completed Habits" />
                  <Line type="monotone" dataKey="total" stroke="#94a3b8" strokeWidth={2} name="Total Habits" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl md:text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Habit Streaks</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getStreakData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="streak" fill="#a855f7" name="Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl md:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Completion Rate</p>
                  <p className="text-2xl md:text-3xl font-bold text-indigo-500">{completionRate}%</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Longest Streak</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-500">
                    {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0} days
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-green-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Habits</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-500">{habits.length}</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tasks Completed</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-500">{tasks.filter(t => t.completed).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTaskTracker;