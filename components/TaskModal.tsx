import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Task } from '../store/tasksSlice';
import { Radii, Spacing, ThemeColors, Typography } from '../constants/theme';
import { useAppTheme } from '../providers/theme-provider';
import {
  buildDefaultSchedule,
  normalizeDateKey,
  normalizeDurationMinutes,
  normalizeTimeValue,
} from '../utils/taskSchedule';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'> & { id?: string; completed?: boolean }) => void;
  task: Task | null;
}

const durationPresets = [25, 45, 60, 90];

export default function TaskModal({ visible, onClose, onSave, task }: TaskModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Work');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setTag(task.tag);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setStartTime(task.startTime);
      setDurationInput(String(task.durationMinutes));
      setFocusModeEnabled(task.focusModeEnabled);
      return;
    }

    const defaults = buildDefaultSchedule();
    setTitle('');
    setDescription('');
    setTag('Work');
    setPriority('normal');
    setDueDate(defaults.dueDate);
    setStartTime(defaults.startTime);
    setDurationInput(String(defaults.durationMinutes));
    setFocusModeEnabled(false);
  }, [task, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    const defaults = buildDefaultSchedule();

    onSave({
      ...(task && { id: task.id, completed: task.completed }),
      title: title.trim(),
      description: description.trim(),
      tag,
      priority,
      dueDate: normalizeDateKey(dueDate, defaults.dueDate),
      startTime: normalizeTimeValue(startTime, defaults.startTime),
      durationMinutes: normalizeDurationMinutes(durationInput, defaults.durationMinutes),
      focusModeEnabled,
    });
    onClose();
  };

  const categories = ['Work', 'Personal', 'Design', 'Admin'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.surface}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{task ? 'Edit Task' : 'New Task'}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
            <TextInput
              style={styles.inputTitle}
              placeholder="Task title..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            <TextInput
              style={styles.inputDesc}
              placeholder="Quick note, links, or context for the session."
              placeholderTextColor={colors.onSurfaceVariant}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Schedule</Text>
            <View style={styles.scheduleGrid}>
              <View style={styles.scheduleField}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={styles.scheduleInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.onSurfaceVariant}
                  autoCapitalize="none"
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>

              <View style={styles.scheduleField}>
                <Text style={styles.fieldLabel}>Start time</Text>
                <TextInput
                  style={styles.scheduleInput}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.onSurfaceVariant}
                  autoCapitalize="none"
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
            </View>

            <View style={styles.durationSection}>
              <View style={styles.durationHeader}>
                <Text style={styles.label}>Time to take</Text>
                <Text style={styles.durationSuffix}>minutes</Text>
              </View>
              <TextInput
                style={styles.scheduleInput}
                placeholder="30"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="number-pad"
                value={durationInput}
                onChangeText={setDurationInput}
              />
              <View style={styles.durationPresets}>
                {durationPresets.map((duration) => {
                  const active = Number(durationInput) === duration;
                  return (
                    <Pressable
                      key={duration}
                      style={[styles.presetChip, active && styles.presetChipActive]}
                      onPress={() => setDurationInput(String(duration))}
                    >
                      <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>
                        {duration}m
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.focusRow}>
              <View style={styles.focusCopy}>
                <Text style={styles.focusTitle}>Focus mode</Text>
                <Text style={styles.focusBody}>
                  Reserve a countdown session using this task&apos;s planned duration.
                </Text>
              </View>
              <Switch
                value={focusModeEnabled}
                onValueChange={setFocusModeEnabled}
                trackColor={{
                  false: colors.surfaceContainerHighest,
                  true: colors.primary + '66',
                }}
                thumbColor={focusModeEnabled ? colors.primary : colors.surfaceContainerLow}
              />
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  style={[styles.chip, tag === category && styles.chipActive]}
                  onPress={() => setTag(category)}
                >
                  <Text style={[styles.chipText, tag === category && styles.chipTextActive]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipRow}>
              {(['low', 'normal', 'high'] as const).map((level) => {
                const isActive = priority === level;
                return (
                  <Pressable
                    key={level}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                      level === 'high' && isActive && styles.highPriorityChip,
                    ]}
                    onPress={() => setPriority(level)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                        level === 'high' && isActive && styles.highPriorityChipText,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!title.trim()}
              style={!title.trim() && styles.saveDisabled}
            >
              <LinearGradient
                colors={[colors.primary, colors.quickNoteGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btn}
              >
                <Text style={styles.btnPrimaryText}>Save Task</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    surface: {
      backgroundColor: colors.surfaceContainerLow,
      borderTopLeftRadius: Radii.xl,
      borderTopRightRadius: Radii.xl,
      maxHeight: '90%',
      padding: Spacing.xl,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.outlineVariant,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: isDark ? 0.3 : 0.12,
      shadowRadius: 20,
      elevation: 24,
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
      color: colors.onSurface,
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
      color: colors.onSurface,
      borderBottomWidth: 2,
      borderBottomColor: colors.surfaceContainerHighest,
      paddingVertical: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    inputDesc: {
      fontFamily: Typography.body,
      fontSize: 16,
      color: colors.onSurfaceVariant,
      minHeight: 80,
      marginBottom: Spacing.xl,
    },
    label: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: Spacing.sm,
      fontWeight: '500',
    },
    scheduleGrid: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    scheduleField: {
      flex: 1,
      gap: Spacing.xs,
    },
    fieldLabel: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    scheduleInput: {
      fontFamily: Typography.body,
      fontSize: 15,
      color: colors.onSurface,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radii.lg,
      backgroundColor: colors.surfaceContainerHigh,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.outlineVariant,
    },
    durationSection: {
      marginBottom: Spacing.xl,
    },
    durationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    durationSuffix: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    durationPresets: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    presetChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.pill,
      backgroundColor: colors.surfaceContainerHigh,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.outlineVariant,
    },
    presetChipActive: {
      backgroundColor: colors.primaryDim,
      borderColor: colors.primaryDim,
    },
    presetChipText: {
      fontFamily: Typography.body,
      fontSize: 13,
      color: colors.onSurfaceVariant,
      fontWeight: '600',
    },
    presetChipTextActive: {
      color: colors.onPrimary,
    },
    focusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderRadius: Radii.lg,
      backgroundColor: colors.surfaceContainerHigh,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.outlineVariant,
      marginBottom: Spacing.xl,
    },
    focusCopy: {
      flex: 1,
    },
    focusTitle: {
      fontFamily: Typography.headline,
      fontSize: 17,
      color: colors.onSurface,
      marginBottom: 2,
    },
    focusBody: {
      fontFamily: Typography.body,
      fontSize: 13,
      lineHeight: 18,
      color: colors.onSurfaceVariant,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    chip: {
      backgroundColor: colors.surfaceContainerHigh,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.pill,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.outlineVariant,
    },
    chipActive: {
      backgroundColor: colors.primaryDim,
      borderColor: colors.primaryDim,
    },
    highPriorityChip: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.tertiary,
    },
    chipText: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: colors.onSurfaceVariant,
      fontWeight: '500',
    },
    chipTextActive: {
      color: colors.onPrimary,
    },
    highPriorityChipText: {
      color: colors.tertiary,
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
    btnPrimaryText: {
      fontFamily: Typography.body,
      fontWeight: '600',
      color: colors.onPrimary,
      fontSize: 14,
    },
    btnSecondary: {
      backgroundColor: 'transparent',
    },
    btnSecondaryText: {
      fontFamily: Typography.body,
      fontWeight: '600',
      color: colors.onSurface,
      fontSize: 14,
    },
    saveDisabled: {
      opacity: 0.5,
    },
  });
