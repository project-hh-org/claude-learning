import { cn } from '@/lib/cn';
import type { CompletionCategory } from '@/types';
import { ScrollView, Text, View } from 'react-native';

type PlanningHeaderProps = {
  score: number;
  phaseLabel: string;
  categories: CompletionCategory[];
};

function barColor(score: number): string {
  if (score < 34) return 'bg-red-500';
  if (score < 67) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function PlanningHeader({ score, phaseLabel, categories }: PlanningHeaderProps) {
  const completed = categories.filter((c) => c.score > 0);
  const rounded = Math.round(score);

  return (
    <View className="border-b border-border bg-background px-4 py-3 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {phaseLabel || ' '}
        </Text>
        <Text className="text-sm font-medium text-muted-foreground">{rounded}%</Text>
      </View>

      <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <View
          className={cn('h-full rounded-full', barColor(rounded))}
          style={{ width: `${Math.max(0, Math.min(100, rounded))}%` }}
        />
      </View>

      {completed.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pt-1">
            {completed.map((c) => (
              <View key={c.key} className="rounded-full border border-input bg-muted px-3 py-1">
                <Text className="text-xs text-foreground">
                  {c.label} · {Math.round(c.score)}%
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
