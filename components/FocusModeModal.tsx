import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Task } from '../store/tasksSlice';
import { Radii, Spacing, ThemeColors, Typography } from '../constants/theme';
import { useAppTheme } from '../providers/theme-provider';
import {
  formatDuration,
  formatFocusCountdown,
  formatStartTime,
  formatTaskDate,
} from '../utils/taskSchedule';

interface FocusModeModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function FocusModeModal({ visible, task, onClose }: FocusModeModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const totalSeconds = useMemo(() => (task ? task.durationMinutes * 60 : 0), [task]);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!visible || !task) {
      setIsRunning(false);
      return;
    }

    setRemainingSeconds(task.durationMinutes * 60);
    setIsRunning(true);
  }, [task, visible]);

  useEffect(() => {
    if (!visible || !isRunning || remainingSeconds <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, remainingSeconds, visible]);

  const completionRatio =
    totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - remainingSeconds / totalSeconds)) : 0;
  const sessionFinished = remainingSeconds === 0;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <LinearGradient
          colors={[colors.quickNoteGradientStart, colors.quickNoteGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sheet}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Focus Mode</Text>
              <Text style={styles.headerTitle}>
                {sessionFinished ? 'Session complete' : 'Stay with one task'}
              </Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <MaterialIcons name="close" size={22} color={colors.onPrimary} />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text style={styles.taskTitle}>{task?.title ?? 'Task session'}</Text>
            <Text style={styles.timerText}>{formatFocusCountdown(remainingSeconds)}</Text>
            <Text style={styles.heroSubtitle}>
              {sessionFinished
                ? 'You reached the end of the planned focus block.'
                : 'Silence distractions and work only on this task until the timer ends.'}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionRatio * 100}%` }]} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <MaterialIcons name="event" size={16} color={colors.onPrimary} />
              <Text style={styles.metaChipText}>{task ? formatTaskDate(task.dueDate) : 'Today'}</Text>
            </View>
            <View style={styles.metaChip}>
              <MaterialIcons name="schedule" size={16} color={colors.onPrimary} />
              <Text style={styles.metaChipText}>
                {task ? formatStartTime(task.startTime) : '--:--'}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <MaterialIcons name="timer" size={16} color={colors.onPrimary} />
              <Text style={styles.metaChipText}>
                {task ? formatDuration(task.durationMinutes) : '0 min'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryAction}
              onPress={() => {
                if (!task) {
                  return;
                }

                setRemainingSeconds(task.durationMinutes * 60);
                setIsRunning(false);
              }}
            >
              <Text style={styles.secondaryActionText}>Reset</Text>
            </Pressable>
            <Pressable
              style={styles.primaryAction}
              onPress={() => {
                if (sessionFinished) {
                  setRemainingSeconds(totalSeconds);
                  setIsRunning(true);
                  return;
                }

                setIsRunning((current) => !current);
              }}
            >
              <Text style={styles.primaryActionText}>
                {sessionFinished ? 'Restart' : isRunning ? 'Pause' : 'Resume'}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    sheet: {
      borderRadius: 32,
      padding: Spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 22 },
      shadowOpacity: isDark ? 0.32 : 0.18,
      shadowRadius: 28,
      elevation: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.lg,
    },
    eyebrow: {
      fontFamily: Typography.body,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      color: colors.onPrimary,
      opacity: 0.72,
    },
    headerTitle: {
      marginTop: 6,
      fontFamily: Typography.headline,
      fontSize: 28,
      lineHeight: 32,
      color: colors.onPrimary,
    },
    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: Radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    hero: {
      marginTop: 28,
      marginBottom: 28,
    },
    taskTitle: {
      fontFamily: Typography.headline,
      fontSize: 22,
      lineHeight: 28,
      color: colors.onPrimary,
      opacity: 0.92,
    },
    timerText: {
      marginTop: 24,
      fontFamily: Typography.headline,
      fontSize: 72,
      lineHeight: 78,
      color: colors.onPrimary,
      letterSpacing: -3,
    },
    heroSubtitle: {
      marginTop: 12,
      fontFamily: Typography.body,
      fontSize: 15,
      lineHeight: 22,
      color: colors.onPrimary,
      opacity: 0.82,
    },
    progressTrack: {
      height: 12,
      borderRadius: Radii.pill,
      backgroundColor: 'rgba(255,255,255,0.16)',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: Radii.pill,
      backgroundColor: colors.onPrimary,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginTop: Spacing.xl,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.pill,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    metaChipText: {
      fontFamily: Typography.body,
      fontSize: 13,
      fontWeight: '600',
      color: colors.onPrimary,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.xl,
    },
    secondaryAction: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    secondaryActionText: {
      fontFamily: Typography.body,
      fontSize: 14,
      fontWeight: '700',
      color: colors.onPrimary,
    },
    primaryAction: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      borderRadius: Radii.pill,
      backgroundColor: colors.onPrimary,
    },
    primaryActionText: {
      fontFamily: Typography.body,
      fontSize: 14,
      fontWeight: '700',
      color: colors.onSurface,
    },
  });
