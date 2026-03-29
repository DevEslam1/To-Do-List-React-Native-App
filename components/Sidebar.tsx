import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilter, TasksState } from '../store/tasksSlice';
import ProgressBar from './ProgressBar';
import { Colors, Typography, Spacing, Radii } from '../constants/theme';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.8, 320);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.tasks.filter);
  const tasks = useAppSelector((state) => state.tasks.items);

  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    }
  }, [isOpen]);

  const handleNav = (newFilter: TasksState['filter']) => {
    dispatch(setFilter(newFilter));
    onClose();
  };

  const navItems: Array<{ icon: keyof typeof MaterialIcons.glyphMap; label: string; id: TasksState['filter'] }> = [
    { icon: 'today', label: 'Today', id: 'today' },
    { icon: 'inbox', label: 'Inbox', id: 'inbox' },
    { icon: 'folder-open', label: 'Projects', id: 'projects' },
    { icon: 'check-circle-outline', label: 'Completed', id: 'completed' },
  ];

  const completeCount = tasks.filter(t => t.completed).length;
  const progressRatio = tasks.length > 0 ? completeCount / tasks.length : 0;
  
  if (!isOpen && !isAnimating) {
    return null; 
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Background Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sidebar Panel */}
      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Editorial Nocturne</Text>
          <Text style={styles.subtitle}>PERSONAL WORKSPACE</Text>
        </View>

        <View style={styles.nav}>
          {navItems.map((item) => {
            const isActive = filter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleNav(item.id)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={isActive ? Colors.dark.onSecondaryContainer : Colors.dark.onSurfaceVariant}
                />
                <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Weekly Focus */}
        <View style={styles.momentumCard}>
          <Text style={styles.momentumTitle}>Weekly Focus</Text>
          <Text style={styles.momentumDesc}>
            You've completed {Math.round(progressRatio * 100)}% of your tasks this week. Keep the momentum.
          </Text>
          <ProgressBar progress={progressRatio} />
        </View>

        <View style={styles.spacer} />

        <Pressable style={styles.navItem} onPress={() => {}}>
          <MaterialIcons name="settings" size={24} color={Colors.dark.onSurfaceVariant} />
          <Text style={styles.navItemText}>Settings</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.dark.surfaceContainerLow,
    borderRightWidth: 1,
    borderRightColor: Colors.dark.outlineVariant + '40', // 25% opacity
    padding: Spacing.xl,
    paddingTop: 60, // accommodate safe area
    zIndex: 20,
    flexDirection: 'column',
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: Typography.headline,
    fontWeight: '700',
    fontSize: 20,
    color: Colors.dark.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Typography.body,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.dark.onSurfaceVariant,
  },
  nav: {
    gap: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.pill,
    gap: Spacing.md,
  },
  navItemActive: {
    backgroundColor: Colors.dark.secondaryContainer,
  },
  navItemText: {
    fontFamily: Typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.onSurfaceVariant,
  },
  navItemTextActive: {
    color: Colors.dark.onSecondaryContainer,
  },
  momentumCard: {
    marginTop: 'auto',
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.dark.surfaceContainer,
    borderRadius: Radii.xl,
  },
  momentumTitle: {
    fontFamily: Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.onSurface,
    marginBottom: Spacing.sm,
  },
  momentumDesc: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.dark.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  spacer: {
    height: 1,
    backgroundColor: Colors.dark.outlineVariant + '40',
    marginVertical: Spacing.md,
  },
});
