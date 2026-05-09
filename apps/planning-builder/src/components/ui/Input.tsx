import { cn } from '@/lib/cn';
import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, containerClassName, ...rest }, ref) => {
    return (
      <View className={cn('gap-1', containerClassName)}>
        {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="hsl(240 3.8% 46.1%)"
          className={cn(
            'h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground',
            error && 'border-destructive',
            className,
          )}
          {...rest}
        />
        {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';
