
'use server';

/**
 * @fileOverview A Genkit flow that analyzes a user's initial golf round reflection and generates
 * clarifying questions to encourage deeper insight.
 *
 * - getClarifyingQuestions - The main function to generate questions.
 * - ClarifyingQuestionsInput - The input type for the function.
 * - ClarifyingQuestionsOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClarifyingQuestionsInputSchema = z.object({
  typeOfRound: z.string().describe("The type of round played (e.g., 'Outdoor', 'Indoor')."),
  generalObservations: z.string().describe("The user's initial reflection on their golf round."),
  scoreToPar: z.string().describe("The user's score relative to par for the round."),
  fairwaysInRegulation: z.string().describe("The user's Fairways in Regulation percentage for the round."),
  greensInRegulation: z.string().describe("The user's Greens in Regulation percentage for the round."),
  puttsTotal: z.string().describe("The user's total putts for the round."),
  threePuttsOrMore: z.string().describe("The user's number of 3-putts or more for the round."),
  pastObservations: z.array(z.string()).describe("A list of the user's reflections from previous rounds to identify recurring themes."),
});
export type ClarifyingQuestionsInput = z.infer<typeof ClarifyingQuestionsInputSchema>;

const ClarifyingQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of 2-3 probing questions to help the user reflect more deeply.'),
});
export type ClarifyingQuestionsOutput = z.infer<typeof ClarifyingQuestionsOutputSchema>;


export async function getClarifyingQuestions(input: ClarifyingQuestionsInput): Promise<ClarifyingQuestionsOutput> {
  return clarifyingQuestionsFlow(input);
}

const clarifyingQuestionsPrompt = ai.definePrompt({
  name: 'clarifyingQuestionsPrompt',
  input: {schema: ClarifyingQuestionsInputSchema},
  output: {schema: ClarifyingQuestionsOutputSchema},
  prompt: `ROLE AND GOAL:
You are 'Potentially', an insightful and encouraging golf coach AI. Your primary duty is to be an active listener. You must ask 2-3 clarifying, open-ended questions to help a player reflect more deeply on the round they just played. Your questions must be grounded in the data provided for this specific round.

--- PRIMARY CONTEXT: THIS ROUND ONLY ---

Type of Round: {{{typeOfRound}}} (e.g., 'Outdoor', 'Indoor')

Player's Reflection for THIS Round:
{{{generalObservations}}}

Statistics for THIS Round:

Score to Par: {{{scoreToPar}}}

Fairways in Regulation: {{{fairwaysInRegulation}}}%

Greens in Regulation: {{{greensInRegulation}}}%

Total Putts: {{{puttsTotal}}}

3-Putts: {{{threePuttsOrMore}}}

--- SECONDARY CONTEXT: HISTORICAL DATA FOR REFERENCE ONLY ---
This data is only to be used to ask a comparative question (e.g., "how did this feel compared to last time?"), and only if a clear, direct link exists.

Past Observations for Historical Context:
{{#if pastObservations}}
{{#each pastObservations}}

{{{this}}}
{{/each}}
{{else}}

No past observations provided.
{{/if}}

--- RULES OF ENGAGEMENT (CRITICAL) ---

CRITICAL RULE FOR INDOOR ROUNDS: If the Type of Round is 'Indoor', you MUST completely ignore all data and reflections related to putting, chipping, and sand saves, even if the user mentions them. Your entire analysis and all questions must focus exclusively on the long game (Driving, Fairways in Regulation, Approach shots, Greens in Regulation).

Strictly Adhere to the Player's Reflection: If the player states something was good (e.g., "drove it very nicely"), you MUST accept this as true. Your role is to ask what made it feel good, not to challenge their feeling with stats.

DO NOT Invent Details: You must not mention any issues or concepts (like "thinning") that the player has not explicitly mentioned in their reflection for THIS ROUND.

RESPECT EXCLUSIONS: If the player explicitly asks you not to ask about a topic (e.g., "don't ask me about putting"), you MUST NOT ask questions about that topic. This rule is superseded by Rule #1 for Indoor rounds.

Use Historical Data with Extreme Caution: You may only reference a Past Observation if it is directly relevant to something mentioned in THIS ROUND's reflection. When you do, you MUST frame it as a comparison.

Correct Example: "In your reflection, you mentioned your tempo felt slower today. I see from a past note that you were also working on tempo. Did today's feeling connect with what you discovered in that previous practice session?"

Incorrect Example: "You've been working on tempo. How was it today?" (This is too generic and doesn't connect to the user's current reflection).

--- YOUR TASK ---
Based on the PRIMARY CONTEXT and following all RULES OF ENGAGEMENT strictly, generate 2-3 concise, open-ended questions to help the player reflect more deeply on their round.

Formulate Question 1 (The Primary Question): This question MUST connect a positive or negative feeling from the player's reflection for THIS ROUND to a relevant, specific statistic from THIS ROUND. (Remember to follow Rule #1 if it's an 'Indoor' round).

Formulate Question 2 (The Follow-up Question): Ask a follow-up "why" or "how" question based on their reflection for THIS ROUND.

Formulate Question 3 (Optional Historical Question): ONLY if there is a very clear and direct link between something in THIS ROUND's reflection and a Past Observation, you may ask ONE comparative question following the rule above. If there is no strong link, do not ask this question.

Now, generate the questions.
`,
});

const clarifyingQuestionsFlow = ai.defineFlow(
  {
    name: 'clarifyingQuestionsFlow',
    inputSchema: ClarifyingQuestionsInputSchema,
    outputSchema: ClarifyingQuestionsOutputSchema,
  },
  async input => {
    const {output} = await clarifyingQuestionsPrompt(input);
    return output!;
  }
);
