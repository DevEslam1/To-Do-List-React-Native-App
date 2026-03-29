import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTasks,
  addTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  clearError,
  Task,
} from '../store/tasksSlice';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import Sidebar from '../components/Sidebar';
import { Colors, Typography, Spacing, Radii } from '../constants/theme';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { items, status, filter, error, saving } = useAppSelector((state) => state.tasks);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks once on mount
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Auto-dismiss API errors after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // ── Filtered view (pure client-side, no re-fetch needed) ──────────────────
  const today = new Date().toISOString().split('T')[0];
  const filteredTasks = items.filter((task) => {
    switch (filter) {
      case 'today':     return task.dueDate === today && !task.completed;
      case 'completed': return task.completed;
      case 'projects':  return !task.completed;
      case 'inbox':
      default:          return !task.completed;
    }
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleTask = (task: Task) => {
    dispatch(toggleTaskCompletion(task));
  };

  const handlePressTask = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = (task: Task) => {
    dispatch(deleteTask(task.id));
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'completed'> & { id?: string; completed?: boolean }
  ) => {
    if (taskData.id) {
      // Editing an existing task — must provide full Task object
      dispatch(updateTask({ ...taskData, id: taskData.id, completed: taskData.completed ?? false }));
    } else {
      // Creating a new task — id is assigned by json-server
      const { id: _id, completed: _completed, ...newTask } = taskData as any;
      dispatch(addTask({ ...newTask, completed: false }));
    }
  };

  const getFilterTitle = () => {
    switch (filter) {
      case 'today':     return 'Today';
      case 'inbox':     return 'Inbox';
      case 'completed': return 'Completed';
      case 'projects':  return 'Projects';
      default:          return 'Tasks';
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.iconButton} onPress={() => setSidebarOpen(true)}>
            <MaterialIcons name="menu" size={28} color={Colors.dark.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.title}>{getFilterTitle()}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="search" size={28} color={Colors.dark.onSurfaceVariant} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="more-horiz" size={28} color={Colors.dark.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      {/* Inline Error Banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color={Colors.dark.tertiary} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Task List */}
      {status === 'loading' && items.length === 0 ? (
        <View style={styles.centerElements}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : status === 'failed' && items.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="storage" size={64} color={Colors.dark.onSurfaceVariant} style={{ opacity: 0.3 }} />
          <Text style={styles.emptyStateText}>Could not read local storage.</Text>
          <Pressable style={styles.retryBtn} onPress={() => dispatch(fetchTasks())}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="fact-check" size={64} color={Colors.dark.onSurfaceVariant} style={{ opacity: 0.3 }} />
          <Text style={styles.emptyStateText}>No tasks here.{'\n'}You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={handleToggleTask}
              onPress={handlePressTask}
              onDelete={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <Pressable
        style={[styles.fab, saving && styles.fabDisabled]}
        disabled={saving}
        onPress={() => {
          setEditingTask(null);
          setModalVisible(true);
        }}
      >
        {saving
          ? <ActivityIndicator size="small" color={Colors.dark.onPrimary} />
          : <MaterialIcons name="add" size={32} color={Colors.dark.onPrimary} />
        }
      </Pressable>

      {/* Modals & Overlays */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <TaskModal
        visible={modalVisible}
        task={editingTask}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontFamily: Typography.headline,
    fontSize: 40,
    fontWeight: '700',
    color: Colors.dark.onSurface,
    letterSpacing: -1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xs,
    borderRadius: Radii.pill,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.dark.tertiary + '18',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.dark.tertiary + '40',
  },
  errorText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.dark.tertiary,
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
    paddingTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xxl,
    width: 64,
    height: 64,
    borderRadius: Radii.pill,
    backgroundColor: Colors.dark.primary,
    elevation: 8,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fabDisabled: {
    backgroundColor: Colors.dark.primaryDim,
    opacity: 0.7,
  },
  centerElements: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.dark.onSurfaceVariant,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyStateText: {
    fontFamily: Typography.body,
    fontSize: 17,
    color: Colors.dark.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  retryBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.dark.primary + '20',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.dark.primary + '60',
  },
  retryText: {
    fontFamily: Typography.body,
    fontWeight: '600',
    color: Colors.dark.primary,
    fontSize: 14,
  },
});
