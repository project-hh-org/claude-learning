import { fetchNextStep } from '@/features/planner/api';
import { usePlannerStore } from '@/stores/planner';
import type { StepContext, StepResponse } from '@/types';
import { useMutation } from '@tanstack/react-query';

export function useStepMutation() {
  const setIsAiLoading = usePlannerStore((s) => s.setIsAiLoading);
  const setCurrentSuggestions = usePlannerStore((s) => s.setCurrentSuggestions);
  const updateCompletionDelta = usePlannerStore((s) => s.updateCompletionDelta);

  return useMutation<StepResponse, Error, StepContext>({
    mutationFn: fetchNextStep,
    onMutate: () => {
      setIsAiLoading(true);
    },
    onSuccess: (res) => {
      setCurrentSuggestions(res.suggestions, res.phaseLabel);
      // Apply completion delta to categories the AI says are advanced this step.
      const covered = res.suggestions.map((s) => s.category);
      updateCompletionDelta(res.completionDelta, covered);
    },
    onSettled: () => {
      setIsAiLoading(false);
    },
  });
}
