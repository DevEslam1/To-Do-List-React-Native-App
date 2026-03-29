import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Platform } from 'react-native';

// React Native android emulator uses 10.0.2.2 to access localhost.
// iOS simulator uses localhost.
// On a physical device, this needs to be your computer's local IP address (e.g. 192.168.1.x)
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'normal' | 'high';
  tag: string;
  dueDate: string;
}

export interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'today' | 'inbox' | 'completed' | 'projects';
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'today',
};

// Thunks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await axios.get(`${API_URL}/tasks`);
  return response.data;
});

export const addTask = createAsyncThunk('tasks/addTask', async (task: Omit<Task, 'id'>) => {
  const response = await axios.post(`${API_URL}/tasks`, task);
  return response.data;
});

export const updateTask = createAsyncThunk('tasks/updateTask', async (task: Task) => {
  const response = await axios.put(`${API_URL}/tasks/${task.id}`, task);
  return response.data;
});

export const toggleTaskCompletion = createAsyncThunk('tasks/toggleTaskCompletion', async (task: Task) => {
  const updatedTask = { ...task, completed: !task.completed };
  const response = await axios.put(`${API_URL}/tasks/${task.id}`, updatedTask);
  return response.data;
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string) => {
  await axios.delete(`${API_URL}/tasks/${id}`);
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<TasksState['filter']>) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Add
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Toggle string completion
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => String(t.id) !== String(action.payload));
      });
  },
});

export const { setFilter } = tasksSlice.actions;

export default tasksSlice.reducer;
