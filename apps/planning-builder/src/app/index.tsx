import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { t } from '@/lib/i18n';
import { usePlannerStore } from '@/stores/planner';
import type { Platform, ProjectTemplate } from '@/types';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const TEMPLATES: ProjectTemplate[] = [
  'ecommerce',
  'social',
  'saas',
  'internal-tool',
  'content',
  'booking',
];

const PLATFORMS: Platform[] = ['app', 'web', 'responsive', 'multi'];

export default function StartScreen() {
  const [goal, setGoal] = useState('');
  const [template, setTemplate] = useState<ProjectTemplate>('custom');
  const [platforms, setPlatforms] = useState<Platform[]>(['app']);

  const initProject = usePlannerStore((s) => s.initProject);
  const existingProject = usePlannerStore((s) => s.project);
  const canStart = goal.trim().length > 0 || template !== 'custom';

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const onStart = () => {
    if (!canStart) return;
    const finalGoal = goal.trim() || t(`templates.${template}`);
    initProject(finalGoal, template, platforms.length ? platforms : ['app']);
    const sessionId = usePlannerStore.getState().project?.id ?? `session-${Date.now()}`;
    router.push(`/plan/${sessionId}`);
  };

  const onResume = () => {
    if (!existingProject) return;
    router.push(`/plan/${existingProject.id}`);
  };

  return (
    <Screen>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-8 pb-12 gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">{t('start.title')}</Text>
          <Text className="text-base text-muted-foreground">{t('start.subtitle')}</Text>
        </View>

        {existingProject ? (
          <Pressable
            onPress={onResume}
            className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3"
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-primary">
              {t('start.resume')} — {existingProject.goal}
            </Text>
          </Pressable>
        ) : null}

        <Input
          multiline
          numberOfLines={4}
          placeholder={t('start.goalPlaceholder')}
          value={goal}
          onChangeText={setGoal}
          className="h-28 py-3"
        />

        <View className="gap-3">
          <Text className="text-sm font-medium text-muted-foreground">
            {t('start.orPickTemplate')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {TEMPLATES.map((tpl) => {
                const active = template === tpl;
                return (
                  <Pressable
                    key={tpl}
                    onPress={() => setTemplate(tpl)}
                    className={`rounded-full border px-4 py-2 ${
                      active ? 'border-primary bg-primary' : 'border-input bg-background'
                    }`}
                    accessibilityRole="button"
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {t(`templates.${tpl}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-medium text-muted-foreground">{t('start.platforms')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = platforms.includes(p);
              return (
                <Pressable
                  key={p}
                  onPress={() => togglePlatform(p)}
                  className={`rounded-full border px-4 py-2 ${
                    active ? 'border-primary bg-primary/10' : 'border-input bg-background'
                  }`}
                  accessibilityRole="button"
                >
                  <Text
                    className={`text-sm font-medium ${active ? 'text-primary' : 'text-foreground'}`}
                  >
                    {t(`platforms.${p}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-border bg-background px-5 py-3">
        <Button onPress={onStart} disabled={!canStart} size="lg">
          {t('start.startPlanning')}
        </Button>
      </View>
    </Screen>
  );
}
