import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { t } from '@/lib/i18n';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type CustomInputCardProps = {
  items: string[];
  onAdd: (text: string) => void;
  onRemove: (text: string) => void;
};

export function CustomInputCard({ items, onAdd, onRemove }: CustomInputCardProps) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <View className="rounded-xl border border-dashed border-input bg-background p-3 gap-2">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            value={text}
            onChangeText={setText}
            placeholder={t('flow.customInputPlaceholder')}
            onSubmitEditing={submit}
            returnKeyType="done"
          />
        </View>
        <Button size="sm" onPress={submit} disabled={!text.trim()}>
          +
        </Button>
      </View>

      {items.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 pt-1">
          {items.map((item) => (
            <Pressable
              key={item}
              onPress={() => onRemove(item)}
              accessibilityRole="button"
              className="rounded-full border border-primary bg-primary/10 px-3 py-1"
            >
              <Text className="text-xs text-primary">{item} ×</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
