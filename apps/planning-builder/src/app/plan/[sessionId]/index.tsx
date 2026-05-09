import { CustomInputCard } from '@/components/flow/CustomInputCard';
import { PlanningHeader } from '@/components/flow/PlanningHeader';
import { SkeletonCard } from '@/components/flow/SkeletonCard';
import { SuggestionCard } from '@/components/flow/SuggestionCard';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useStepMutation } from '@/features/planner/hooks';
import { t } from '@/lib/i18n';
import { usePlannerStore, usePlannerTransient } from '@/stores/planner';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function PlanFlowScreen() {
  const project = usePlannerStore((s) => s.project);
  const currentStep = usePlannerStore((s) => s.currentStep);
  const phaseLabel = usePlannerStore((s) => s.currentPhaseLabel);
  const score = usePlannerStore((s) => s.completionScore);
  const categories = usePlannerStore((s) => s.completionCategories);
  const suggestions = usePlannerStore((s) => s.currentSuggestions);
  const isAiLoading = usePlannerStore((s) => s.isAiLoading);
  const appendSelectionLog = usePlannerStore((s) => s.appendSelectionLog);
  const bumpStep = usePlannerStore((s) => s.bumpStep);

  const selectedIds = usePlannerTransient((s) => s.selectedIds);
  const customItems = usePlannerTransient((s) => s.customItems);
  const toggleSelectedId = usePlannerTransient((s) => s.toggleSelectedId);
  const addCustomItem = usePlannerTransient((s) => s.addCustomItem);
  const removeCustomItem = usePlannerTransient((s) => s.removeCustomItem);
  const clearTransient = usePlannerTransient((s) => s.clear);

  const stepMutation = useStepMutation();
  const fetchedStepRef = useRef<number | null>(null);

  // Fetch a fresh AI step whenever we land on a new step that hasn't been
  // populated yet. We read once-off state via getState() to avoid useEffect
  // re-firing on every store change. The `currentStep` dep is what re-triggers.
  // biome-ignore lint/correctness/useExhaustiveDependencies: effect uses getState() intentionally
  useEffect(() => {
    const state = usePlannerStore.getState();
    if (!state.project) return;
    if (fetchedStepRef.current === state.currentStep) return;
    if (state.currentSuggestions.length > 0 || state.isAiLoading) return;

    fetchedStepRef.current = state.currentStep;
    stepMutation.mutate({
      projectGoal: state.project.goal,
      platforms: state.project.platforms,
      stepNumber: state.currentStep,
      completionScore: state.completionScore,
      selectionLog: state.selectionLog,
      prevAiSuggestions: state.prevAiSuggestions.map((s) => ({
        id: s.id,
        title: s.title,
        hasComponent: s.hasComponent,
        componentType: s.componentType,
      })),
      coveredCategories: state.completionCategories.filter((c) => c.score > 0).map((c) => c.key),
    });
  }, [currentStep]);

  if (!project) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-muted-foreground">{t('common.error')}</Text>
          <Button className="mt-4" onPress={() => router.replace('/')}>
            {t('common.retry')}
          </Button>
        </View>
      </Screen>
    );
  }

  const onConfirm = () => {
    if (selectedIds.size === 0 && customItems.length === 0) return;
    const componentsChosen = suggestions
      .filter((s) => selectedIds.has(s.id) && s.hasComponent && s.componentType)
      .map((s) => s.componentType as string);
    appendSelectionLog({
      step: currentStep,
      phaseLabel,
      selected: Array.from(selectedIds),
      custom: customItems,
      componentsChosen,
      timestamp: new Date().toISOString(),
    });
    clearTransient();
    bumpStep();
  };

  const canConfirm = selectedIds.size > 0 || customItems.length > 0;
  const canOpenWireframe = score >= 40;

  return (
    <Screen>
      <PlanningHeader score={score} phaseLabel={phaseLabel} categories={categories} />

      <ScrollView className="flex-1" contentContainerClassName="px-4 pt-4 pb-6 gap-3">
        {isAiLoading && suggestions.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              selected={selectedIds.has(s.id)}
              onToggle={toggleSelectedId}
            />
          ))
        )}

        <CustomInputCard items={customItems} onAdd={addCustomItem} onRemove={removeCustomItem} />
      </ScrollView>

      <View className="border-t border-border bg-background px-4 py-3 gap-2">
        {canOpenWireframe ? (
          <Button
            variant="outline"
            size="md"
            onPress={() => router.push(`/plan/${project.id}/wireframe`)}
          >
            {t('flow.viewWireframe')}
          </Button>
        ) : null}
        <Button onPress={onConfirm} disabled={!canConfirm || isAiLoading} size="lg">
          {t('flow.next')}
        </Button>
      </View>
    </Screen>
  );
}
