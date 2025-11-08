import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SPACING.md;
        baseStyle.paddingVertical = SPACING.sm;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SPACING.xl;
        baseStyle.paddingVertical = SPACING.md;
        break;
      default:
        baseStyle.paddingHorizontal = SPACING.lg;
        baseStyle.paddingVertical = SPACING.md;
    }

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = COLORS.primary;
        if (!disabled) {
          Object.assign(baseStyle, SHADOWS.small);
        }
        break;
      case 'secondary':
        baseStyle.backgroundColor = COLORS.backgroundPink;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = COLORS.primary;
        break;
      case 'text':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.fontSize = FONT_SIZES.sm;
        break;
      case 'large':
        baseStyle.fontSize = FONT_SIZES.xl;
        break;
      default:
        baseStyle.fontSize = FONT_SIZES.lg;
    }

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.color = COLORS.white;
        break;
      case 'secondary':
        baseStyle.color = COLORS.primary;
        break;
      case 'outline':
      case 'text':
        baseStyle.color = COLORS.primary;
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.primary} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
