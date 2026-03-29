import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../store/tasksSlice';
import { Colors, Typography, Spacing, Radii } from '../constants/Theme';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onPress }: TaskItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
        task.completed && styles.containerCompleted,
      ]}
      onPress={() => onPress(task)}
    >
      <Pressable
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        onPress={() => onToggle(task)}
        hitSlop={10}
      >
        {task.completed && (
          <MaterialIcons name="check" size={16} color={Colors.onPrimary} />
        )}
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.titleCompleted]}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.metaContainer}>
          <View style={[styles.badge, { backgroundColor: Colors.surfaceContainerHigh }]}>
            <Text style={[styles.badgeText, { color: Colors.primary }]}>{task.tag}</Text>
          </View>
          {task.priority === 'high' && (
            <View style={[styles.badge, styles.badgeHigh]}>
              <Text style={[styles.badgeText, { color: Colors.tertiary }]}>High Priority</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radii.xl,
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  containerPressed: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  containerCompleted: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    marginRight: Spacing.md,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  titleCompleted: {
    color: Colors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  description: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  badgeHigh: {
    backgroundColor: 'rgba(255, 150, 187, 0.1)', // Tertiary 10%
  },
  badgeText: {
    fontFamily: Typography.body,
    fontSize: 12,
    fontWeight: '600',
  },
});
