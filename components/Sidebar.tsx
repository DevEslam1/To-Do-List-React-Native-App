import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilter, TasksState } from '../store/tasksSlice';
import { Radii, Spacing, ThemeColors, Typography } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/use-responsive-layout';
import { useAppTheme } from '../providers/theme-provider';

type SidebarVariant = 'modal' | 'docked';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: SidebarVariant;
}

export default function Sidebar({ isOpen, onClose, variant = 'modal' }: SidebarProps) {
  const dispatch = useAppDispatch();
  const layout = useResponsiveLayout();
  const { colors, isDark, theme, toggleTheme } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const filter = useAppSelector((state) => state.tasks.filter);
  const tasks = useAppSelector((state) => state.tasks.items);
  const sidebarWidth =
    variant === 'docked' ? layout.dockedSidebarWidth : layout.overlaySidebarWidth;

  const translateX = useRef(new Animated.Value(variant === 'modal' ? -sidebarWidth : 0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (variant !== 'modal') {
      translateX.setValue(0);
      overlayOpacity.setValue(1);
      setIsAnimating(false);
      return;
    }

    translateX.setValue(isOpen ? 0 : -sidebarWidth);
  }, [isOpen, overlayOpacity, sidebarWidth, translateX, variant]);

  useEffect(() => {
    if (variant !== 'modal') {
      return undefined;
    }

    if (isOpen) {
      setIsAnimating(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -sidebarWidth,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setIsAnimating(false));
    return undefined;
  }, [isOpen, overlayOpacity, sidebarWidth, translateX, variant]);

  const handleNav = (nextFilter: TasksState['filter']) => {
    dispatch(setFilter(nextFilter));

    if (variant === 'modal') {
      onClose();
    }
  };

  const remainingCount = tasks.filter((task) => !task.completed).length;

  const navItems: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    id: TasksState['filter'];
  }[] = [
    { icon: 'wb-sunny', label: 'Today', id: 'today' },
    { icon: 'inbox', label: 'Inbox', id: 'inbox' },
    { icon: 'category', label: 'Tags', id: 'projects' },
    { icon: 'check-circle-outline', label: 'Completed', id: 'completed' },
  ];

  const panelContent = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Task Log</Text>
        <Text style={styles.subtitle}>{remainingCount} active tasks in your workspace</Text>
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => {
          const active = filter === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => handleNav(item.id)}
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={active ? colors.onPrimary : colors.onSurfaceVariant}
              />
              <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.themeToggle} onPress={() => void toggleTheme()}>
        <View style={styles.themeToggleLeft}>
          <MaterialIcons
            name={theme === 'dark' ? 'light-mode' : 'dark-mode'}
            size={22}
            color={colors.primary}
          />
          <Text style={styles.themeToggleText}>
            Switch to {theme === 'dark' ? 'light' : 'dark'} mode
          </Text>
        </View>
        <Text style={styles.themeBadge}>{theme.toUpperCase()}</Text>
      </Pressable>

      <View style={styles.footerCard}>
        <Text style={styles.footerLabel}>Workspace</Text>
        <Text style={styles.footerValue}>
          {tasks.length} tasks tracked, {remainingCount} still in motion.
        </Text>
      </View>

      {variant === 'modal' ? (
        <Pressable style={styles.settingsRow} onPress={onClose}>
          <MaterialIcons name="close" size={22} color={colors.onSurfaceVariant} />
          <Text style={styles.settingsText}>Close panel</Text>
        </Pressable>
      ) : null}
    </>
  );

  if (variant === 'docked') {
    return (
      <View style={[styles.panel, styles.panelDocked, { width: sidebarWidth }]}>
        {panelContent}
      </View>
    );
  }

  if (!isOpen && !isAnimating) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.panel, styles.panelModal, { width: sidebarWidth, transform: [{ translateX }] }]}
      >
        {panelContent}
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    panel: {
      paddingHorizontal: Spacing.xl,
      paddingTop: 36,
      paddingBottom: Spacing.xl,
      backgroundColor: colors.surfaceContainerLow,
      borderRightWidth: 1,
      borderRightColor: colors.outlineVariant,
    },
    panelModal: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
    },
    panelDocked: {
      alignSelf: 'stretch',
      flexShrink: 0,
      paddingTop: 20,
      paddingBottom: 28,
    },
    header: {
      marginBottom: Spacing.xxl,
    },
    title: {
      fontFamily: Typography.headline,
      fontSize: 28,
      color: colors.primary,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontFamily: Typography.body,
      fontSize: 13,
      lineHeight: 19,
      color: colors.onSurfaceVariant,
    },
    nav: {
      gap: Spacing.sm,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radii.pill,
      backgroundColor: colors.surfaceContainer,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.outlineVariant,
    },
    navItemActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    navText: {
      fontFamily: Typography.body,
      fontSize: 15,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
    },
    navTextActive: {
      color: colors.onPrimary,
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radii.xl,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: Spacing.md,
    },
    themeToggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      flex: 1,
    },
    themeToggleText: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: colors.onSurface,
      flex: 1,
    },
    themeBadge: {
      fontFamily: Typography.body,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: colors.primary,
    },
    footerCard: {
      marginTop: 'auto',
      padding: Spacing.lg,
      borderRadius: Radii.xl,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    footerLabel: {
      fontFamily: Typography.body,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.primary,
      marginBottom: Spacing.sm,
    },
    footerValue: {
      fontFamily: Typography.body,
      fontSize: 14,
      lineHeight: 20,
      color: colors.onSurfaceVariant,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginTop: Spacing.lg,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
    },
    settingsText: {
      fontFamily: Typography.body,
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
  });
