import { api } from '@/lib/api';
import type { StepContext, StepResponse } from '@/types';

export function fetchNextStep(context: StepContext): Promise<StepResponse> {
  return api.post<StepResponse>('/api/step', context);
}
