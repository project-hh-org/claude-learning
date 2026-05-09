import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

// TODO: Implement wireframe editor (steps 16-21 of SPEC.md).
export default function WireframeScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Text className="text-xl font-semibold text-foreground">Wireframe (coming soon)</Text>
        <Text className="text-center text-sm text-muted-foreground">
          와이어프레임 에디터는 후속 PR에서 구현됩니다. 현재는 기획 플로우와 산출물 생성까지
          동작합니다.
        </Text>
        <Button onPress={() => router.back()} variant="outline">
          ← 기획 플로우
        </Button>
      </View>
    </Screen>
  );
}
