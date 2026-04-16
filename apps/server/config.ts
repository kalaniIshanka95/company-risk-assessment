import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  port: parseInt(process.env.PORT ?? '3000', 10),
  llm: {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-haiku',
    temperature: 0,
  },
};

