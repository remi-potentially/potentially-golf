

'use server';

/**
 * @fileOverview The primary Orchestrator/Router agent for the Potentially AI system.
 *
 * This agent acts as the central traffic controller, receiving user requests and
 * routing them to the appropriate specialist agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { buildPracticePlan } from './agent-coach-planning';
import { analyzeRoundReflection } from './ai-round-reflection';
import { aiDrillFocus } from './ai-drill-focus';
import { getClarifyingQuestions } from './ai-clarifying-questions';
import { getDrillClarifyingQuestions } from './ai-drill-reflection';
import { getCoachCheckIn } from './ai-coach-check-in';
import { getPreRoundFocus } from './ai-pre-round-focus';

// Define the types of tasks the orchestrator can handle
const TaskTypeSchema = z.enum([
  'buildPracticePlan',
  'getDrillFocus',
  'getPreRoundBriefing',
  'getRoundReflection',
  'getClarifyingQuestions',
  'getDrillClarifyingQuestions',
  'getCoachCheckIn',
]);

const OrchestratorInputSchema = z.object({
  task: TaskTypeSchema,
  input: z.any(),
});
export type OrchestratorInput = z.infer<typeof OrchestratorInputSchema>;

// A generic output schema that can hold any agent's response.
const OrchestratorOutputSchema = z.object({
  output: z.any(),
  agent: z.string(),
});
export type OrchestratorOutput = z.infer<typeof OrchestratorOutputSchema>;


/**
 * The main orchestrator flow. It determines the user's intent and routes
 * the request to the correct specialist agent.
 * @param {OrchestratorInput} input - The task and its specific input data.
 * @returns {Promise<OrchestratorOutput>} The result from the specialist agent.
 */
export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorOutput> {
    return orchestratorFlow(input);
}


const orchestratorFlow = ai.defineFlow(
  {
    name: 'orchestratorFlow',
    inputSchema: OrchestratorInputSchema,
    outputSchema: OrchestratorOutputSchema,
  },
  async ({ task, input }) => {
    
    // In the future, a more complex router could use an LLM call to determine the task.
    // For now, we use a simple switch statement for direct routing.

    let agentResponse: any;
    let agentName: string;

    switch (task) {
      case 'buildPracticePlan':
        console.log('Orchestrator: Routing to Coach Planning Agent...');
        agentResponse = await buildPracticePlan(input);
        agentName = 'CoachPlanningAgent';
        break;
      
      case 'getRoundReflection':
        console.log('Orchestrator: Routing to Round Debrief Workflow...');
        agentResponse = await analyzeRoundReflection(input);
        agentName = 'RoundDebriefWorkflow'; // This is a multi-agent workflow
        break;
      
      case 'getDrillFocus':
        console.log('Orchestrator: Routing to Drill Focus Agent...');
        agentResponse = await aiDrillFocus(input);
        agentName = 'DrillFocusAgent';
        break;

      case 'getClarifyingQuestions':
        console.log('Orchestrator: Routing to Clarifying Questions Agent...');
        agentResponse = await getClarifyingQuestions(input);
        agentName = 'ClarifyingQuestionsAgent';
        break;

      case 'getDrillClarifyingQuestions':
        console.log('Orchestrator: Routing to Drill Reflection Agent...');
        agentResponse = await getDrillClarifyingQuestions(input);
        agentName = 'DrillReflectionAgent';
        break;

      case 'getCoachCheckIn':
        console.log('Orchestrator: Routing to Coach Check-in Agent...');
        agentResponse = await getCoachCheckIn(input);
        agentName = 'CoachCheckInAgent';
        break;
      
      case 'getPreRoundBriefing':
         console.log('Orchestrator: Routing to Pre-Round Briefing Agent...');
         agentResponse = await getPreRoundFocus(input);
         agentName = 'PreRoundBriefingAgent';
         break;

      default:
        console.error(`Orchestrator: No route found for task "${task}"`);
        throw new Error(`Orchestrator: No route found for task "${task}"`);
    }

    return {
      output: agentResponse,
      agent: agentName,
    };
  }
);
