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
  Task 
} from '../store/tasksSlice';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import Sidebar from '../components/Sidebar';
import { Colors, Typography, Spacing, Radii } from '../constants/Theme';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { items, status, filter } = useAppSelector((state) => state.tasks);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const filteredTasks = items.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'today') return task.dueDate === new Date().toISOString().split('T')[0] && !task.completed;
    if (filter === 'projects') return !task.completed; // Simplification
    return !task.completed; // 'inbox' or default
  });

  const handleToggleTask = (task: Task) => {
    dispatch(toggleTaskCompletion(task));
  };

  const handlePressTask = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (taskData.id) {
      dispatch(updateTask(taskData));
    } else {
      dispatch(addTask(taskData as Omit<Task, 'id'>));
    }
  };

  const getFilterTitle = () => {
    switch(filter) {
      case 'today': return 'Today';
      case 'inbox': return 'Inbox';
      case 'completed': return 'Completed';
      case 'projects': return 'Projects';
      default: return 'Tasks';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.iconButton} onPress={() => setSidebarOpen(true)}>
            <MaterialIcons name="menu" size={28} color={Colors.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.title}>{getFilterTitle()}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="search" size={28} color={Colors.onSurfaceVariant} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="more-horiz" size={28} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      {/* Task List */}
      {status === 'loading' && items.length === 0 ? (
        <View style={styles.centerElements}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="fact-check" size={64} color={Colors.onSurfaceVariant} style={{ opacity: 0.3 }}/>
          <Text style={styles.emptyStateText}>No tasks here. You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TaskItem task={item} onToggle={handleToggleTask} onPress={handlePressTask} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <Pressable 
        style={styles.fab} 
        onPress={() => {
          setEditingTask(null);
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={32} color={Colors.onPrimary} />
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
    backgroundColor: Colors.background,
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
    color: Colors.onSurface,
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
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100, // Make room for FAB
    paddingTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xxl,
    width: 64,
    height: 64,
    borderRadius: Radii.pill,
    backgroundColor: Colors.primary,
    elevation: 8,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerElements: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    opacity: 0.7,
  },
  emptyStateText: {
    fontFamily: Typography.body,
    fontSize: 18,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.md,
  }
});
