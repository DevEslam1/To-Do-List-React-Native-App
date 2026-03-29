import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "normal" | "high";
  tag: string;
  dueDate: string;
}

export interface TasksState {
  items: Task[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filter: "today" | "inbox" | "completed" | "projects";
  saving: boolean;
  deleting: string | null;
}

const initialState: TasksState = {
  items: [],
  status: "idle",
  error: null,
  filter: "today",
  saving: false,
  deleting: null,
};

const TASKS_STORAGE_KEY = "@tasks_data";

// Helper to save to AsyncStorage
const saveTasksToStorage = async (tasks: Task[]) => {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

export const fetchTasks = createAsyncThunk<
  Task[],
  void,
  { rejectValue: string }
>("tasks/fetchTasks", async (_, { rejectWithValue }) => {
  try {
    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (!storedTasks) return [];

    try {
      return JSON.parse(storedTasks);
    } catch (e) {
      console.error("Failed to parse tasks JSON from storage:", e);
      // If data is corrupted, wipe it and return empty array
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
      return [];
    }
  } catch (err: any) {
    console.error("AsyncStorage read error:", err);
    return rejectWithValue("Failed to load tasks from internal storage.");
  }
});

export const addTask = createAsyncThunk<
  Task,
  Omit<Task, "id">,
  { rejectValue: string; state: { tasks: TasksState } }
>("tasks/addTask", async (task, { getState, rejectWithValue }) => {
  try {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
    };
    const currentTasks = getState().tasks.items;
    await saveTasksToStorage([...currentTasks, newTask]);
    return newTask;
  } catch (err: any) {
    return rejectWithValue("Failed to self task locally.");
  }
});

export const updateTask = createAsyncThunk<
  Task,
  Task,
  { rejectValue: string; state: { tasks: TasksState } }
>("tasks/updateTask", async (task, { getState, rejectWithValue }) => {
  try {
    const currentTasks = getState().tasks.items;
    const updatedTasks = currentTasks.map((t) => (t.id === task.id ? task : t));
    await saveTasksToStorage(updatedTasks);
    return task;
  } catch (err: any) {
    return rejectWithValue("Failed to update task locally.");
  }
});

export const toggleTaskCompletion = createAsyncThunk<
  Task,
  Task,
  {
    rejectValue: { id: string; originalTask: Task };
    state: { tasks: TasksState };
  }
>("tasks/toggleTaskCompletion", async (task, { getState, rejectWithValue }) => {
  const updatedTask = { ...task, completed: !task.completed };
  try {
    const currentTasks = getState().tasks.items;
    const updatedTasks = currentTasks.map((t) =>
      t.id === updatedTask.id ? updatedTask : t,
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
>("tasks/deleteTask", async (id, { getState, rejectWithValue }) => {
  try {
    const currentTasks = getState().tasks.items;
    const filteredTasks = currentTasks.filter((t) => t.id !== id);
    await saveTasksToStorage(filteredTasks);
    return id;
  } catch (err: any) {
    return rejectWithValue("Failed to delete task locally.");
  }
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<TasksState["filter"]>) {
      state.filter = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error.";
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
        state.error = action.payload ?? "Failed to add task.";
      })
      .addCase(updateTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? "Failed to update task.";
      })
      .addCase(toggleTaskCompletion.pending, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.meta.arg.id);
        if (index !== -1) {
          state.items[index].completed = !state.items[index].completed;
        }
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(toggleTaskCompletion.rejected, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex(
            (t) => t.id === action.payload!.id,
          );
          if (index !== -1) state.items[index] = action.payload.originalTask;
        }
        state.error = "Could not update task. Please check your storage.";
      })
      .addCase(deleteTask.pending, (state, action) => {
        state.deleting = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.deleting = null;
        state.items = state.items.filter(
          (t) => String(t.id) !== String(action.payload),
        );
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.deleting = null;
        state.error = action.payload ?? "Failed to delete task.";
      });
  },
});

export const { setFilter, clearError } = tasksSlice.actions;

export default tasksSlice.reducer;
