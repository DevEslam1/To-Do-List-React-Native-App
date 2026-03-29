import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  addTask,
  clearError,
  deleteTask,
  fetchTasks,
  setFilter,
  Task,
  toggleTaskCompletion,
  updateTask,
} from '../store/tasksSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import FocusModeModal from '../components/FocusModeModal';
import ProgressBar from '../components/ProgressBar';
import Sidebar from '../components/Sidebar';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import { Radii, Spacing, ThemeColors, Typography } from '../constants/theme';
import { useAppTheme } from '../providers/theme-provider';
import { buildDefaultSchedule, getTodayDateKey } from '../utils/taskSchedule';

type HomeNavFilter = 'today' | 'inbox' | 'projects';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const { items, status, filter, error, saving } = useAppSelector((state) => state.tasks);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timer = setTimeout(() => dispatch(clearError()), 4000);
    return () => clearTimeout(timer);
  }, [dispatch, error]);

  const todayKey = getTodayDateKey();
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const filteredTasks = useMemo(() => {
    const matchingTasks = items.filter((task) => {
      switch (filter) {
        case 'today':
          return task.dueDate === todayKey && !task.completed;
        case 'completed':
          return task.completed;
        case 'projects':
        case 'inbox':
        default:
          return !task.completed;
      }
    });

    return matchingTasks.slice().sort((left, right) => {
      const leftKey = `${left.dueDate} ${left.startTime}`;
      const rightKey = `${right.dueDate} ${right.startTime}`;
      return leftKey.localeCompare(rightKey);
    });
  }, [filter, items, todayKey]);

  const completionCount = items.filter((task) => task.completed).length;
  const progressRatio = items.length > 0 ? completionCount / items.length : 0;
  const completionPercent = Math.round(progressRatio * 100);
  const summaryCount =
    filter === 'completed'
      ? filteredTasks.length
      : filteredTasks.filter((task) => !task.completed).length;

  const sectionTitle = (() => {
    switch (filter) {
      case 'today':
        return 'Today';
      case 'inbox':
        return 'Inbox';
      case 'projects':
        return 'Tags';
      case 'completed':
        return 'Completed';
      default:
        return 'Today';
    }
  })();

  const remainingLabel =
    filter === 'completed'
      ? `${summaryCount} completed tasks archived`
      : `${summaryCount} tasks remaining`;

  const quickAddPlaceholder =
    filter === 'today'
      ? 'Add a task to Today...'
      : filter === 'inbox'
        ? 'Add a task to Inbox...'
        : filter === 'projects'
          ? 'Add a task to Tags...'
          : 'Add a completed task...';

  const navItems: {
    key: string;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    filterValue: HomeNavFilter;
  }[] = [
    { key: 'today', label: 'TODAY', icon: 'wb-sunny', filterValue: 'today' },
    { key: 'inbox', label: 'INBOX', icon: 'inbox', filterValue: 'inbox' },
    { key: 'tags', label: 'TAGS', icon: 'category', filterValue: 'projects' },
  ];

  const openCreateModal = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setModalVisible(false);
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'completed'> & { id?: string; completed?: boolean }
  ) => {
    if (taskData.id) {
      dispatch(
        updateTask({
          ...taskData,
          id: taskData.id,
          completed: taskData.completed ?? false,
        })
      );
      return;
    }

    const { id: _id, completed: _completed, ...newTask } = taskData as Task & {
      id?: string;
      completed?: boolean;
    };
    dispatch(addTask({ ...newTask, completed: false }));
  };

  const handleQuickAdd = () => {
    const title = quickTaskTitle.trim();
    if (!title) {
      return;
    }

    const quickTag =
      filter === 'projects' ? 'Design' : filter === 'inbox' ? 'Admin' : 'Work';
    const defaultSchedule = buildDefaultSchedule();

    dispatch(
      addTask({
        title,
        description: '',
        completed: false,
        priority: 'normal',
        tag: quickTag,
        dueDate: defaultSchedule.dueDate,
        startTime: defaultSchedule.startTime,
        durationMinutes: defaultSchedule.durationMinutes,
        focusModeEnabled: false,
      })
    );
    setQuickTaskTitle('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => setSidebarOpen(true)}>
            <MaterialIcons name="menu" size={25} color={colors.primary} />
          </Pressable>

          <Text style={styles.headerTitle}>Task Log</Text>

          <Pressable style={styles.avatarButton} onPress={() => setSidebarOpen(true)}>
            <MaterialIcons name="account-circle" size={28} color={colors.avatarIcon} />
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={16} color={colors.tertiary} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {status === 'loading' && items.length === 0 ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Loading tasks...</Text>
          </View>
        ) : status === 'failed' && items.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons
              name="cloud-off"
              size={56}
              color={colors.onSurfaceVariant}
              style={styles.stateIcon}
            />
            <Text style={styles.stateText}>Could not read your local task storage.</Text>
            <Pressable style={styles.retryButton} onPress={() => dispatch(fetchTasks())}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 178 + Math.max(insets.bottom, Spacing.md) },
            ]}
          >
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>{sectionTitle}</Text>
              <View style={styles.bannerMetaRow}>
                <Text style={styles.bannerSubtitleAccent}>{formattedDate}</Text>
                <View style={styles.bannerMetaDot} />
                <Text style={styles.bannerSubtitle}>{remainingLabel}</Text>
              </View>
            </View>

            <View style={styles.taskColumn}>
              {filteredTasks.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Nothing urgent here.</Text>
                  <Text style={styles.emptyBody}>
                    Add a quick one-liner below or open the center button for a full task.
                  </Text>
                </View>
              ) : (
                filteredTasks.map((task, index) => (
                  <TaskItem
                    key={String(task.id)}
                    task={task}
                    index={filteredTasks.length - index}
                    onToggle={(item) => dispatch(toggleTaskCompletion(item))}
                    onPress={(item) => {
                      setEditingTask(item);
                      setModalVisible(true);
                    }}
                    onDelete={(item) => dispatch(deleteTask(item.id))}
                    onStartFocus={(item) => setFocusTask(item)}
                  />
                ))
              )}
            </View>

            <View style={styles.focusCard}>
              <MaterialIcons
                name="trending-up"
                size={116}
                color={colors.onSurface}
                style={styles.focusGraphic}
              />
              <Text style={styles.focusTitle}>Weekly Focus</Text>
              <Text style={styles.focusBody}>
                You&apos;ve completed {completionPercent}% of your task goals this week. Keep the
                momentum.
              </Text>
              <ProgressBar progress={progressRatio} />
            </View>

            <Pressable onPress={openCreateModal}>
              <LinearGradient
                colors={[colors.quickNoteGradientStart, colors.quickNoteGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickNoteCard}
              >
                <View style={styles.quickNoteIcon}>
                  <MaterialIcons name="auto-awesome" size={20} color={colors.onPrimary} />
                </View>
                <Text style={styles.quickNoteLabel}>Quick Note</Text>
                <Text style={styles.quickNoteTitle}>
                  Capture thoughts instantly, then schedule the start time and duration.
                </Text>
              </LinearGradient>
            </Pressable>

            <LinearGradient
              colors={[colors.quickAddGradientStart, colors.quickAddGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.quickAddBar}
            >
              <Text style={styles.quickAddPrefix}>+</Text>
              <TextInput
                style={styles.quickAddInput}
                placeholder={quickAddPlaceholder}
                placeholderTextColor={colors.onSurfaceVariant}
                value={quickTaskTitle}
                onChangeText={setQuickTaskTitle}
                returnKeyType="done"
                onSubmitEditing={() => handleQuickAdd()}
              />
              <Pressable style={styles.quickAddCalendar} onPress={openCreateModal}>
                <MaterialIcons name="calendar-today" size={21} color={colors.onSurfaceVariant} />
              </Pressable>
              <Pressable
                style={[
                  styles.quickAddSave,
                  (!quickTaskTitle.trim() || saving) && styles.quickAddSaveDisabled,
                ]}
                disabled={!quickTaskTitle.trim() || saving}
                onPress={handleQuickAdd}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={styles.quickAddSaveText}>Save</Text>
                )}
              </Pressable>
            </LinearGradient>
          </ScrollView>
        )}

        <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom, 14) }]}>
          {navItems.slice(0, 2).map((item) => {
            const active = filter === item.filterValue;
            return (
              <Pressable
                key={item.key}
                style={styles.navItem}
                onPress={() => dispatch(setFilter(item.filterValue))}
              >
                <MaterialIcons
                  name={item.icon}
                  size={23}
                  color={active ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}

          <Pressable
            style={[styles.centerAction, saving && styles.centerActionDisabled]}
            onPress={openCreateModal}
            disabled={saving}
          >
            <LinearGradient
              colors={[colors.primary, colors.quickNoteGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.centerActionGradient}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <MaterialIcons name="add" size={30} color={colors.onPrimary} />
              )}
            </LinearGradient>
          </Pressable>

          {navItems.slice(2).map((item) => {
            const active = filter === item.filterValue;
            return (
              <Pressable
                key={item.key}
                style={styles.navItem}
                onPress={() => dispatch(setFilter(item.filterValue))}
              >
                <MaterialIcons
                  name={item.icon}
                  size={23}
                  color={active ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}

          <Pressable style={styles.navItem} onPress={() => setSidebarOpen(true)}>
            <MaterialIcons
              name="more-horiz"
              size={23}
              color={sidebarOpen ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.navLabel, sidebarOpen && styles.navLabelActive]}>MORE</Text>
          </Pressable>
        </View>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <TaskModal
          visible={modalVisible}
          task={editingTask}
          onClose={closeModal}
          onSave={handleSaveTask}
        />

        <FocusModeModal visible={Boolean(focusTask)} task={focusTask} onClose={() => setFocusTask(null)} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 28,
      paddingTop: 12,
      paddingBottom: 4,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: Radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      marginLeft: 10,
      fontFamily: Typography.headline,
      fontSize: 20,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    avatarButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.avatarBackground,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.outlineVariant,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginHorizontal: 28,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.lg,
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.tertiary,
    },
    errorText: {
      flex: 1,
      fontFamily: Typography.body,
      fontSize: 13,
      color: colors.tertiary,
    },
    scrollContent: {
      paddingHorizontal: 30,
      gap: 24,
    },
    banner: {
      paddingTop: 26,
      paddingBottom: 4,
    },
    bannerTitle: {
      fontFamily: Typography.headline,
      fontSize: 62,
      lineHeight: 66,
      color: colors.onSurface,
      letterSpacing: -3.2,
    },
    bannerMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 10,
    },
    bannerSubtitleAccent: {
      fontFamily: Typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    bannerMetaDot: {
      width: 6,
      height: 6,
      borderRadius: Radii.pill,
      backgroundColor: colors.bannerDot,
    },
    bannerSubtitle: {
      fontFamily: Typography.body,
      fontSize: 16,
      color: colors.onSurfaceVariant,
    },
    taskColumn: {
      marginTop: 8,
    },
    emptyCard: {
      paddingHorizontal: 10,
      paddingVertical: 22,
      borderBottomWidth: 1,
      borderBottomColor: colors.listDivider,
    },
    emptyTitle: {
      fontFamily: Typography.headline,
      fontSize: 24,
      color: colors.onSurface,
      marginBottom: 6,
    },
    emptyBody: {
      fontFamily: Typography.body,
      fontSize: 15,
      lineHeight: 22,
      color: colors.onSurfaceVariant,
    },
    focusCard: {
      overflow: 'hidden',
      paddingHorizontal: 24,
      paddingVertical: 28,
      borderRadius: 30,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    focusGraphic: {
      position: 'absolute',
      right: -10,
      bottom: -8,
      opacity: isDark ? 0.12 : 0.08,
      transform: [{ rotate: '-6deg' }],
    },
    focusTitle: {
      fontFamily: Typography.headline,
      fontSize: 30,
      lineHeight: 34,
      color: colors.onSurface,
    },
    focusBody: {
      marginTop: 14,
      marginBottom: 22,
      maxWidth: '72%',
      fontFamily: Typography.body,
      fontSize: 15,
      lineHeight: 24,
      color: colors.onSurfaceVariant,
    },
    quickNoteCard: {
      minHeight: 188,
      paddingHorizontal: 24,
      paddingVertical: 28,
      borderRadius: 32,
    },
    quickNoteIcon: {
      width: 44,
      height: 44,
      borderRadius: Radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(57, 0, 140, 0.08)' : 'rgba(255,255,255,0.22)',
      marginBottom: 20,
    },
    quickNoteLabel: {
      fontFamily: Typography.headline,
      fontSize: 24,
      lineHeight: 28,
      color: colors.onPrimary,
    },
    quickNoteTitle: {
      marginTop: 8,
      fontFamily: Typography.body,
      fontSize: 16,
      lineHeight: 22,
      color: colors.onPrimary,
      opacity: isDark ? 0.82 : 0.88,
    },
    quickAddBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: 12,
    },
    quickAddPrefix: {
      fontFamily: Typography.headline,
      fontSize: 30,
      lineHeight: 30,
      color: colors.primary,
    },
    quickAddInput: {
      flex: 1,
      fontFamily: Typography.body,
      fontSize: 16,
      color: colors.onSurface,
      paddingVertical: 4,
    },
    quickAddCalendar: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickAddSave: {
      minWidth: 78,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.primary,
    },
    quickAddSaveDisabled: {
      opacity: 0.45,
    },
    quickAddSaveText: {
      fontFamily: Typography.body,
      fontSize: 14,
      fontWeight: '700',
      color: colors.onPrimary,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xxxl,
      gap: Spacing.md,
    },
    stateIcon: {
      opacity: 0.5,
    },
    stateText: {
      fontFamily: Typography.body,
      fontSize: 15,
      lineHeight: 22,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: Radii.pill,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    retryButtonText: {
      fontFamily: Typography.body,
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    bottomBar: {
      position: 'absolute',
      left: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingTop: 16,
      paddingBottom: 12,
      paddingHorizontal: 10,
      borderRadius: 28,
      backgroundColor: colors.dock,
      borderWidth: 1,
      borderColor: colors.dockBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: 30,
      elevation: 18,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingBottom: 6,
    },
    navLabel: {
      fontFamily: Typography.body,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.9,
      color: colors.onSurfaceVariant,
    },
    navLabelActive: {
      color: colors.primary,
    },
    centerAction: {
      width: 70,
      alignItems: 'center',
      marginTop: -20,
    },
    centerActionDisabled: {
      opacity: 0.72,
    },
    centerActionGradient: {
      width: 56,
      height: 56,
      borderRadius: Radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.24 : 0.12,
      shadowRadius: 18,
      elevation: 12,
    },
  });
