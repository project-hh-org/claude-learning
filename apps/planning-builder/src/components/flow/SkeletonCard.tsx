import { View } from 'react-native';

export function SkeletonCard() {
  return (
    <View className="rounded-xl border border-input bg-muted/40 p-4 gap-2">
      <View className="h-4 w-2/3 rounded bg-muted" />
      <View className="h-3 w-full rounded bg-muted" />
      <View className="h-3 w-5/6 rounded bg-muted" />
    </View>
  );
}
