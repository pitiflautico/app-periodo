import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'pink' | 'gradient';
}

const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      ...SHADOWS.small,
    };

    switch (variant) {
      case 'pink':
        baseStyle.backgroundColor = COLORS.backgroundPink;
        break;
      case 'gradient':
        baseStyle.backgroundColor = COLORS.primary;
        break;
      default:
        baseStyle.backgroundColor = COLORS.white;
    }

    return baseStyle;
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

export default Card;
