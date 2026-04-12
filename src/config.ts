import dotenv from 'dotenv';
dotenv.config();

export const config = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  port: parseInt(process.env.PORT ?? '3000', 10),
  llm: {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-haiku',
    temperature: 0,
  },
};

if (!config.openRouterApiKey) {
  throw new Error('OPENROUTER_API_KEY is not set in environment');
}
