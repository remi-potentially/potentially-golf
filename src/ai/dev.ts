import { config } from 'dotenv';
config();

import '@/ai/flows/ai-round-reflection.ts';
import '@/ai/flows/ai-drill-focus.ts';
import '@/ai/flows/ai-clarifying-questions.ts';
import '@/ai/flows/ai-drill-reflection.ts';
import '@/ai/flows/ai-coach-check-in.ts';
import '@/ai/flows/ai-pre-round-focus.ts';
import '@/ai/flows/orchestrator.ts';
import '@/ai/flows/agent-coach-planning.ts';
import '@/ai/flows/goal-manager-agent.ts';
