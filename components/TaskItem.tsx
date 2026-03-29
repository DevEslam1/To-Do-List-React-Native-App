import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Task } from '../store/tasksSlice';
import { Colors, Typography, Spacing, Radii, Fonts } from '../constants/theme';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onPress, onDelete }: TaskItemProps) {
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
          <MaterialIcons name="check" size={16} color={Colors.dark.onPrimary} />
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
          <View style={[styles.badge, { backgroundColor: Colors.dark.surfaceContainerHigh }]}>
            <Text style={[styles.badgeText, { color: Colors.dark.primary }]}>{task.tag}</Text>
          </View>
          {task.priority === 'high' && (
            <LinearGradient
              colors={[Colors.dark.tertiary + '30', Colors.dark.tertiary + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}
            >
              <Text style={[styles.badgeText, { color: Colors.dark.tertiary }]}>High Priority</Text>
            </LinearGradient>
          )}
        </View>
      </View>

      {/* Delete button */}
      <Pressable
        onPress={() => onDelete(task)}
        hitSlop={8}
        style={styles.deleteBtn}
      >
        <MaterialIcons name="delete-outline" size={20} color={Colors.dark.onSurfaceVariant} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.dark.surfaceContainer,
    borderRadius: Radii.xl,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.outlineVariant + '20',
  },
  containerPressed: {
    backgroundColor: Colors.dark.surfaceContainerHighest,
    transform: [{ scale: 0.98 }],
  },
  containerCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: Colors.dark.outlineVariant,
    marginRight: Spacing.md,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.onSurface,
    marginBottom: 4,
  },
  titleCompleted: {
    color: Colors.dark.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.dark.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: Spacing.sm,
    opacity: 0.5,
  },
  badgeText: {
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
