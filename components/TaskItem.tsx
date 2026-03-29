import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../store/tasksSlice';
import { Fonts, Radii, ThemeColors, Typography } from '../constants/theme';
import { useAppTheme } from '../providers/theme-provider';
import { formatDuration, formatStartTime, formatTaskDate } from '../utils/taskSchedule';

interface TaskItemProps {
  task: Task;
  index?: number;
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
}

export default function TaskItem({
  task,
  index,
  onToggle,
  onPress,
  onDelete,
  onStartFocus,
}: TaskItemProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
        task.completed && styles.containerCompleted,
      ]}
      onPress={() => onPress(task)}
    >
      {index !== undefined ? <Text style={styles.listIndexNumber}>{index}</Text> : null}

      <Pressable
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        hitSlop={10}
        onPress={(event) => {
          event.stopPropagation();
          onToggle(task);
        }}
      >
        {task.completed ? (
          <MaterialIcons name="check" size={20} color={colors.onPrimary} />
        ) : null}
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.titleCompleted]} numberOfLines={3}>
          {task.title}
        </Text>

        <View style={styles.scheduleRow}>
          <View style={styles.metaRow}>
            <MaterialIcons name="event" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{formatTaskDate(task.dueDate)}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{formatStartTime(task.startTime)}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="timer" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{formatDuration(task.durationMinutes)}</Text>
          </View>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.tagChip}>
            <Text style={styles.tagChipText}>{task.tag.toUpperCase()}</Text>
          </View>

          {task.priority === 'high' ? (
            <View style={styles.priorityChip}>
              <MaterialIcons name="flag" size={12} color={colors.tertiary} />
              <Text style={styles.priorityChipText}>High Priority</Text>
            </View>
          ) : null}

          {task.focusModeEnabled && !task.completed ? (
            <Pressable
              style={styles.focusChip}
              onPress={(event) => {
                event.stopPropagation();
                onStartFocus(task);
              }}
            >
              <MaterialIcons name="center-focus-strong" size={14} color={colors.onPrimary} />
              <Text style={styles.focusChipText}>Focus</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Pressable
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onDelete(task);
        }}
        style={styles.deleteBtn}
      >
        <MaterialIcons name="close" size={16} color={colors.onSurfaceVariant} />
      </Pressable>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 22,
      paddingBottom: 26,
      borderBottomWidth: 1,
      borderBottomColor: colors.listDivider,
    },
    containerPressed: {
      backgroundColor: colors.surfaceContainerHigh,
    },
    containerCompleted: {
      opacity: 0.55,
    },
    listIndexNumber: {
      position: 'absolute',
      right: 0,
      top: 22,
      fontFamily: Fonts.headline,
      fontSize: 50,
      fontWeight: '800',
      lineHeight: 54,
      color: colors.onSurface,
      opacity: isDark ? 0.06 : 0.08,
    },
    checkbox: {
      width: 36,
      height: 36,
      borderRadius: Radii.pill,
      borderWidth: 2,
      borderColor: colors.checkboxBorder,
      backgroundColor: colors.checkboxFill,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      marginRight: 18,
    },
    checkboxCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    content: {
      flex: 1,
      paddingRight: 44,
    },
    title: {
      fontFamily: Typography.headline,
      fontSize: 19,
      lineHeight: 31,
      color: colors.onSurface,
      letterSpacing: -0.7,
    },
    titleCompleted: {
      color: colors.onSurfaceVariant,
      textDecorationLine: 'line-through',
    },
    scheduleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 10,
    },
    metaContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
    },
    tagChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      backgroundColor: colors.tagChipBackground,
    },
    tagChipText: {
      fontFamily: Fonts.label,
      fontSize: 11,
      letterSpacing: 1.2,
      color: colors.primary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    priorityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      backgroundColor: colors.dangerSoft,
    },
    priorityChipText: {
      fontFamily: Typography.body,
      fontSize: 12,
      fontWeight: '600',
      color: colors.tertiary,
    },
    focusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      backgroundColor: colors.primary,
    },
    focusChipText: {
      fontFamily: Typography.body,
      fontSize: 12,
      fontWeight: '700',
      color: colors.onPrimary,
    },
    deleteBtn: {
      position: 'absolute',
      right: 0,
      bottom: 24,
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDark ? 0.25 : 0.35,
    },
  });
