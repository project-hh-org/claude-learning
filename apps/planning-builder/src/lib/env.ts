import Constants from 'expo-constants';
import { z } from 'zod';

const envSchema = z.object({
  appEnv: z.enum(['development', 'preview', 'production']).default('development'),
  claudeApiKey: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const raw = {
  appEnv:
    (Constants.expoConfig?.extra?.appEnv as string | undefined) ??
    process.env.APP_ENV ??
    'development',
  claudeApiKey: process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? process.env.CLAUDE_API_KEY,
};

const parsed = envSchema.safeParse(raw);

if (!parsed.success) {
  console.warn('[env] invalid environment variables', parsed.error.flatten().fieldErrors);
}

export const env: Env = parsed.success
  ? parsed.data
  : {
      appEnv: 'development',
      claudeApiKey: undefined,
    };

export const isDev = env.appEnv === 'development';
export const isPreview = env.appEnv === 'preview';
export const isProd = env.appEnv === 'production';
