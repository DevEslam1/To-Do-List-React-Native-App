import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  buildDefaultSchedule,
  normalizeDateKey,
  normalizeDurationMinutes,
  normalizeTimeValue,
} from '../utils/taskSchedule';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'normal' | 'high';
  tag: string;
  dueDate: string;
  startTime: string;
  durationMinutes: number;
  focusModeEnabled: boolean;
}

export interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'today' | 'inbox' | 'completed' | 'projects';
  saving: boolean;
  deleting: string | null;
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'today',
  saving: false,
  deleting: null,
};

const TASKS_STORAGE_KEY = '@tasks_data';

const normalizeTask = (task: Partial<Task>): Task => {
  const scheduleDefaults = buildDefaultSchedule();
  const priority = task.priority === 'low' || task.priority === 'high' ? task.priority : 'normal';

  return {
    id: String(task.id ?? Math.random().toString(36).slice(2, 11)),
    title: typeof task.title === 'string' ? task.title : '',
    description: typeof task.description === 'string' ? task.description : '',
    completed: Boolean(task.completed),
    priority,
    tag: typeof task.tag === 'string' && task.tag.trim() ? task.tag : 'Work',
    dueDate: normalizeDateKey(task.dueDate, scheduleDefaults.dueDate),
    startTime: normalizeTimeValue(task.startTime, scheduleDefaults.startTime),
    durationMinutes: normalizeDurationMinutes(
      task.durationMinutes,
      scheduleDefaults.durationMinutes
    ),
    focusModeEnabled: Boolean(task.focusModeEnabled),
  };
};

const saveTasksToStorage = async (tasks: Task[]) => {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

export const fetchTasks = createAsyncThunk<Task[], void, { rejectValue: string }>(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (!storedTasks) {
        return [];
      }

      try {
        const parsedTasks = JSON.parse(storedTasks) as Partial<Task>[];
        const normalizedTasks = Array.isArray(parsedTasks)
          ? parsedTasks.map((task) => normalizeTask(task))
          : [];

        if (JSON.stringify(parsedTasks) !== JSON.stringify(normalizedTasks)) {
          await saveTasksToStorage(normalizedTasks);
        }

        return normalizedTasks;
      } catch (error) {
        console.error('Failed to parse tasks JSON from storage:', error);
        await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
        return [];
      }
    } catch (error: any) {
      console.error('AsyncStorage read error:', error);
      return rejectWithValue('Failed to load tasks from internal storage.');
    }
  }
);

export const addTask = createAsyncThunk<
  Task,
  Omit<Task, 'id'>,
  { rejectValue: string; state: { tasks: TasksState } }
>('tasks/addTask', async (task, { getState, rejectWithValue }) => {
  try {
    const newTask = normalizeTask({
      ...task,
      id: Math.random().toString(36).slice(2, 11),
    });
    const currentTasks = getState().tasks.items;
    await saveTasksToStorage([...currentTasks, newTask]);
    return newTask;
  } catch (error: any) {
    return rejectWithValue('Failed to save task locally.');
  }
});

export const updateTask = createAsyncThunk<
  Task,
  Task,
  { rejectValue: string; state: { tasks: TasksState } }
>('tasks/updateTask', async (task, { getState, rejectWithValue }) => {
  try {
    const normalizedTask = normalizeTask(task);
    const currentTasks = getState().tasks.items;
    const updatedTasks = currentTasks.map((currentTask) =>
      currentTask.id === normalizedTask.id ? normalizedTask : currentTask
    );
    await saveTasksToStorage(updatedTasks);
    return normalizedTask;
  } catch (error: any) {
    return rejectWithValue('Failed to update task locally.');
  }
});

export const toggleTaskCompletion = createAsyncThunk<
  Task,
  Task,
  {
    rejectValue: { id: string; originalTask: Task };
    state: { tasks: TasksState };
  }
>('tasks/toggleTaskCompletion', async (task, { getState, rejectWithValue }) => {
  const updatedTask = { ...task, completed: !task.completed };

  try {
    const currentTasks = getState().tasks.items;
    const updatedTasks = currentTasks.map((currentTask) =>
      currentTask.id === updatedTask.id ? updatedTask : currentTask
    );
    await saveTasksToStorage(updatedTasks);
    return updatedTask;
  } catch {
    return rejectWithValue({ id: task.id, originalTask: task });
  }
});

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { tasks: TasksState } }
>('tasks/deleteTask', async (id, { getState, rejectWithValue }) => {
  try {
    const currentTasks = getState().tasks.items;
    const filteredTasks = currentTasks.filter((task) => task.id !== id);
    await saveTasksToStorage(filteredTasks);
    return id;
  } catch (error: any) {
    return rejectWithValue('Failed to delete task locally.');
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<TasksState['filter']>) {
      state.filter = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unknown error.';
      })
      .addCase(addTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Failed to add task.';
      })
      .addCase(updateTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'Failed to update task.';
      })
      .addCase(toggleTaskCompletion.pending, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.meta.arg.id);
        if (index !== -1) {
          state.items[index].completed = !state.items[index].completed;
        }
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(toggleTaskCompletion.rejected, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex((task) => task.id === action.payload!.id);
          if (index !== -1) {
            state.items[index] = action.payload.originalTask;
          }
        }
        state.error = 'Could not update task. Please check your storage.';
      })
      .addCase(deleteTask.pending, (state, action) => {
        state.deleting = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.deleting = null;
        state.items = state.items.filter((task) => String(task.id) !== String(action.payload));
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.deleting = null;
        state.error = action.payload ?? 'Failed to delete task.';
      });
  },
});

export const { setFilter, clearError } = tasksSlice.actions;

export default tasksSlice.reducer;
