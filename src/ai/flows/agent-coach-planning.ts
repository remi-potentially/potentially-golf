
'use server';

/**
 * @fileOverview The Coach Planning Agent (CPA).
 *
 * This agent is responsible for analyzing user performance data and
 * constructing a personalized practice plan with clear rationale.
 * It acts as the "architect" of the player's improvement plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DrillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
});

const IdentifiedAreaOfPotentialSchema = z.object({
  tag: z.string(),
  score: z.number(),
});

const BuildPracticePlanInputSchema = z.object({
  allDrills: z.array(DrillSchema).describe('The complete list of all available drills in the library.'),
  identifiedAreasOfPotential: z.array(IdentifiedAreaOfPotentialSchema).describe("A list of the user's statistically identified weaknesses from their last round, sorted by priority."),
  targetDrillCount: z.number().describe('The number of drills the user wants in their plan.'),
});
type BuildPracticePlanInput = z.infer<typeof BuildPracticePlanInputSchema>;


const RecommendedDrillSchema = z.object({
  drillId: z.string().describe('The unique ID of the recommended drill.'),
  rationale: z.string().describe('A concise, data-driven justification for why this specific drill was recommended, referencing the user\'s areas of potential.'),
});

const BuildPracticePlanOutputSchema = z.object({
  recommendedDrills: z.array(RecommendedDrillSchema).describe('An array of recommended drills that form the new practice plan.'),
});
type BuildPracticePlanOutput = z.infer<typeof BuildPracticePlanOutputSchema>;


/**
 * The main entry point for the Coach Planning Agent.
 * @param {BuildPracticePlanInput} input - The user's performance data and available drills.
 * @returns {Promise<BuildPracticePlanOutput>} A structured practice plan.
 */
export async function buildPracticePlan(input: BuildPracticePlanInput): Promise<BuildPracticePlanOutput> {
  return buildPracticePlanFlow(input);
}


const buildPracticePlanPrompt = ai.definePrompt({
  name: 'buildPracticePlanPrompt',
  input: { schema: BuildPracticePlanInputSchema },
  output: { schema: BuildPracticePlanOutputSchema },
  prompt: `You are the Coach Planning Agent. Your goal is to act as an expert golf coach and build a highly relevant, data-driven practice plan for a user.

CONTEXT:
- The user wants a new practice plan with exactly {{targetDrillCount}} drills.
- The user's primary areas for improvement, based on their last round, are: {{#each identifiedAreasOfPotential}}'{{tag}}' (priority score: {{score}}), {{/each}}. A higher score means a bigger area of potential.

AVAILABLE DRILLS:
Here is the complete list of drills you can choose from:
{{#each allDrills}}
- ID: {{id}}, Name: "{{name}}", Category: {{category}}, Description: "{{description}}"
{{/each}}

YOUR TASK:
1.  **Analyze the Data:** Review the user's "areas of potential" and their priority scores.
2.  **Select the Best Drills:** From the list of available drills, select the {{targetDrillCount}} most appropriate drills that directly target these weaknesses. Prioritize drills that address the highest-scoring areas of potential. Do not select more than {{targetDrillCount}} drills.
3.  **Provide Clear Rationale:** For each drill you select, you MUST write a concise, encouraging, and data-driven rationale. Explain WHY you chose that drill by linking it directly to one of the user's specific areas of potential. For example, if the area is 'threePuttHigh', a good rationale would be: "This drill is excellent for developing speed control, which is key to eliminating those three-putts we saw in your last round."

CRITICAL INSTRUCTIONS:
- You MUST return exactly {{targetDrillCount}} drills.
- Your entire response MUST conform to the JSON schema for the output.

Now, generate the practice plan.
`,
});


const buildPracticePlanFlow = ai.defineFlow(
  {
    name: 'buildPracticePlanFlow',
    inputSchema: BuildPracticePlanInputSchema,
    outputSchema: BuildPracticePlanOutputSchema,
  },
  async (input) => {
    const { output } = await buildPracticePlanPrompt(input);
    if (!output) {
      throw new Error("The AI agent failed to generate a practice plan.");
    }
    return output;
  }
);
