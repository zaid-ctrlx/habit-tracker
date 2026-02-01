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
  Bell
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

const HabitTaskTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl md:text-3xl
 font-bold text-gray-800 mb-2">Habit & Task Tracker</h1>
          <p className="text-gray-600">Build better habits, accomplish more tasks</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-2 flex gap-2 overflow-x-auto">

          {['dashboard', 'habits', 'tasks', 'reminders', 'progress'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-md text-sm md:text-base
 font-medium transition-colors ${activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Today's Progress</p>
                    <p className="text-2xl md:text-3xl
 font-bold text-indigo-600">{completionRate}%</p>
                    <p className="text-gray-500 text-sm">{todayCompletion}/{habits.length} habits</p>
                  </div>
                  <Target className="text-indigo-600" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Tasks</p>
                    <p className="text-2xl md:text-3xl
 font-bold text-blue-600">{activeTasks}</p>
                    <p className="text-gray-500 text-sm">{tasks.length} total</p>
                  </div>
                  <Calendar className="text-blue-600" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Reminders</p>
                    <p className="text-2xl md:text-3xl
 font-bold text-green-600">{reminders.filter(r => r.enabled).length}</p>
                    <p className="text-gray-500 text-sm">{reminders.length} total</p>
                  </div>
                  <Bell className="text-green-600" size={40} />
                </div>
              </div>
            </div>

            {/* Today's Habits */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Habits</h2>
              <div className="space-y-4 md:space-y-3
">
                {habits.slice(0, 5).map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className="p-2 active:scale-95"
                      >
                        {habit.completedDates[today] ? (
                          <CheckCircle className="text-green-600" size={28} />
                        ) : (
                          <Circle className="text-gray-400" size={28} />
                        )}
                      </button>


                      <div>
                        <p className="font-medium text-gray-800">{habit.name}</p>
                        <p className="text-sm text-gray-500">{habit.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-600">{habit.streak} day streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tasks</h2>
              <div className="space-y-4 md:space-y-3
">
                {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="p-2 active:scale-95"
                      >
                        <Circle className="text-gray-400" size={28} />
                      </button>

                      <div>
                        <p className="font-medium text-gray-800">{task.name}</p>
                        <p className="text-sm text-gray-500">Due: {task.dueDate || 'No date'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold
 text-gray-800">Daily Habits</h2>
              <button
                onClick={() => setShowAddHabit(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} /> Add Habit
              </button>
            </div>

            {showAddHabit && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Habit name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-3"
                />
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-3"
                >
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Social">Social</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={addHabit} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Save
                  </button>
                  <button onClick={() => setShowAddHabit(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 md:space-y-3
">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="p-2 active:scale-95"
                    >
                      {habit.completedDates[today] ? (
                        <CheckCircle className="text-green-600" size={28} />
                      ) : (
                        <Circle className="text-gray-400" size={28} />
                      )}
                    </button>

                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-lg">{habit.name}</p>
                      <p className="text-sm text-gray-500">{habit.category} • {habit.streak} day streak</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-red-500 hover:text-red-700 active:scale-95"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold
 text-gray-800">Tasks</h2>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} /> Add Task
              </button>
            </div>

            {showAddTask && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-3"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-3"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-3"
                />
                <div className="flex gap-2">
                  <button onClick={addTask} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Save
                  </button>
                  <button onClick={() => setShowAddTask(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Active</h3>
                <div className="space-y-4 md:space-y-3
">
                  {tasks.filter(t => !t.completed).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="p-2 active:scale-95"
                        >
                          <Circle className="text-gray-400" size={28} />
                        </button>

                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{task.name}</p>
                          <p className="text-sm text-gray-500">Due: {task.dueDate || 'No date set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {task.priority}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-red-500 hover:text-red-700 active:scale-95"
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
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Completed</h3>
                  <div className="space-y-4 md:space-y-3
">
                    {tasks.filter(t => t.completed).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg opacity-75">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="p-2 active:scale-95"
                          >
                            <CheckCircle className="text-green-600" size={28} />
                          </button>

                          <div className="flex-1">
                            <p className="font-medium text-gray-800 line-through">{task.name}</p>
                            <p className="text-sm text-gray-500">Completed</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-red-500 hover:text-red-700 active:scale-95"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold
 text-gray-800">Reminders</h2>
              <button
                onClick={() => setShowAddReminder(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} /> Add Reminder
              </button>
            </div>

            {showAddReminder && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Reminder text"
                  value={newReminder.text}
                  onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-3"
                />
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-3"
                />
                <div className="flex gap-2">
                  <button onClick={addReminder} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Save
                  </button>
                  <button onClick={() => setShowAddReminder(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 md:space-y-3
">
              {reminders.map(reminder => (
                <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Clock className={reminder.enabled ? 'text-indigo-600' : 'text-gray-400'} size={28} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{reminder.text}</p>
                      <p className="text-sm text-gray-500">{reminder.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${reminder.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {reminder.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 text-red-500 hover:text-red-700 active:scale-95"
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl md:text-2xl font-bold
 text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" /> Weekly Progress
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getProgressData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={2} name="Completed Habits" />
                  <Line type="monotone" dataKey="total" stroke="#94a3b8" strokeWidth={2} name="Total Habits" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl md:text-2xl font-bold
 text-gray-800 mb-6">Habit Streaks</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getStreakData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="streak" fill="#4f46e5" name="Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl md:text-2xl font-bold
 text-gray-800 mb-4">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Average Completion Rate</p>
                  <p className="text-2xl md:text-3xl
 font-bold text-indigo-600">{completionRate}%</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Longest Streak</p>
                  <p className="text-2xl md:text-3xl
 font-bold text-blue-600">
                    {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0} days
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Habits</p>
                  <p className="text-2xl md:text-3xl
 font-bold text-green-600">{habits.length}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Tasks Completed</p>
                  <p className="text-2xl md:text-3xl
 font-bold text-purple-600">{tasks.filter(t => t.completed).length}</p>
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