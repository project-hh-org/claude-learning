import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import type { Suggestion } from '@/types';
import { Pressable, Text, View } from 'react-native';

type SuggestionCardProps = {
  suggestion: Suggestion;
  selected: boolean;
  onToggle: (id: string) => void;
};

const priorityClasses: Record<Suggestion['priority'], string> = {
  required: 'bg-red-500/10 text-red-600 border-red-500/30',
  recommended: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  optional: 'bg-muted text-muted-foreground border-input',
};

export function SuggestionCard({ suggestion, selected, onToggle }: SuggestionCardProps) {
  return (
    <Pressable
      onPress={() => onToggle(suggestion.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      className={cn(
        'rounded-xl border bg-background p-4 gap-2',
        selected ? 'border-primary bg-primary/5' : 'border-input',
      )}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-base font-semibold text-foreground">{suggestion.title}</Text>
        <View
          className={cn('rounded-full border px-2 py-0.5', priorityClasses[suggestion.priority])}
        >
          <Text className={cn('text-xs font-medium', priorityClasses[suggestion.priority])}>
            {t(`priority.${suggestion.priority}`)}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-muted-foreground">{suggestion.description}</Text>

      {selected ? (
        <View className="mt-1 flex-row items-center gap-1">
          <View className="h-4 w-4 rounded-full bg-primary" />
          <Text className="text-xs font-medium text-primary">선택됨</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
