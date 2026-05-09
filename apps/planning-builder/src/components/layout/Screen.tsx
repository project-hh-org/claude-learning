import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  className?: string;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
};

export function Screen({ children, className, edges = ['top', 'bottom'] }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      <View className={cn('flex-1', className)}>{children}</View>
    </SafeAreaView>
  );
}
