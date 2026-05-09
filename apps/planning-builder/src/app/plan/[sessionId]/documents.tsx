import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

// TODO: Implement DocumentPanel (steps 14-15 of SPEC.md).
export default function DocumentsScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Text className="text-xl font-semibold text-foreground">Documents (coming soon)</Text>
        <Text className="text-center text-sm text-muted-foreground">
          MD / JSON / Figma / AI 프롬프트 산출물 패널은 후속 PR에서 구현됩니다.
        </Text>
        <Button onPress={() => router.back()} variant="outline">
          ← 뒤로
        </Button>
      </View>
    </Screen>
  );
}
