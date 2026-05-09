import { cn } from '@/lib/cn';
import { forwardRef } from 'react';
import { Pressable, type PressableProps, Text, type TextProps } from 'react-native';

type Variant = 'default' | 'destructive' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary',
  destructive: 'bg-destructive',
  outline: 'border border-input bg-transparent',
  ghost: 'bg-transparent',
};

const variantTextClasses: Record<Variant, string> = {
  default: 'text-primary-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-11 px-4',
  lg: 'h-12 px-6',
};

export type ButtonProps = PressableProps & {
  variant?: Variant;
  size?: Size;
  className?: string;
  textClassName?: string;
  textProps?: TextProps;
};

export const Button = forwardRef<typeof Pressable extends never ? never : never, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      className,
      textClassName,
      children,
      disabled,
      textProps,
      ...rest
    },
    _ref,
  ) => {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        className={cn(
          'flex-row items-center justify-center rounded-lg active:opacity-80',
          variantClasses[variant],
          sizeClasses[size],
          disabled && 'opacity-50',
          className,
        )}
        {...rest}
      >
        {typeof children === 'string' ? (
          <Text
            {...textProps}
            className={cn('text-base font-medium', variantTextClasses[variant], textClassName)}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';
