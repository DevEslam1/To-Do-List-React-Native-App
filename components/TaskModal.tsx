import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../store/tasksSlice';
import { Colors, Typography, Spacing, Radii } from '../constants/Theme';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'> & { id?: string, completed?: boolean }) => void;
  task: Task | null;
}

export default function TaskModal({ visible, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Work');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');

  useEffect(() => {
    if (visible && task) {
      setTitle(task.title);
      setDescription(task.description);
      setTag(task.tag);
      setPriority(task.priority);
    } else if (visible && !task) {
      setTitle('');
      setDescription('');
      setTag('Work');
      setPriority('normal');
    }
  }, [visible, task]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(task && { id: task.id, completed: task.completed }),
      title: title.trim(),
      description: description.trim(),
      tag,
      priority,
      dueDate: new Date().toISOString().split('T')[0], // Simplified for now
    });
    onClose();
  };

  const categories = ['Work', 'Personal', 'Design', 'Admin'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.surface}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{task ? 'Edit Task' : 'New Task'}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
            <TextInput
              style={styles.inputTitle}
              placeholder="Task title..."
              placeholderTextColor={Colors.onSurfaceVariant}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            <TextInput
              style={styles.inputDesc}
              placeholder="Quick Note. Capture thoughts instantly."
              placeholderTextColor={Colors.onSurfaceVariant}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Tag Selection */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, tag === c && styles.chipActive]}
                  onPress={() => setTag(c)}
                >
                  <Text style={[styles.chipText, tag === c && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            {/* Priority Selection */}
            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipRow}>
              {(['low', 'normal', 'high'] as const).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.chip,
                    priority === p && styles.chipActive,
                    p === 'high' && priority === p && { backgroundColor: 'rgba(255, 150, 187, 0.2)' }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                      styles.chipText, 
                      priority === p && styles.chipTextActive,
                      p === 'high' && priority === p && { color: Colors.tertiary }
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.btn, styles.btnPrimary, !title.trim() && { opacity: 0.5 }]} 
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.btnPrimaryText}>Save Task</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  surface: {
    backgroundColor: Colors.surfaceContainer,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: '90%',
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontFamily: Typography.headline,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    flexGrow: 0,
  },
  inputTitle: {
    fontFamily: Typography.headline,
    fontSize: 24,
    color: Colors.onSurface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.surfaceContainerHighest,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  inputDesc: {
    fontFamily: Typography.body,
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    minHeight: 80,
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  chip: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  chipActive: {
    backgroundColor: Colors.primaryDim,
  },
  chipText: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.onSurface,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  btn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnPrimaryText: {
    fontFamily: Typography.body,
    fontWeight: '600',
    color: Colors.onPrimary,
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    fontFamily: Typography.body,
    fontWeight: '600',
    color: Colors.onSurface,
    fontSize: 14,
  },
});
