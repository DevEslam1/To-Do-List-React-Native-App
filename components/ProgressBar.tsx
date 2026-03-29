import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Radii, ThemeColors } from '../constants/theme';
import { useAppTheme } from '../providers/theme-provider';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, progress]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      height: 10,
      backgroundColor: colors.progressTrack,
      borderRadius: Radii.pill,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.progressFill,
      borderTopRightRadius: Radii.pill,
      borderBottomRightRadius: Radii.pill,
    },
  });
