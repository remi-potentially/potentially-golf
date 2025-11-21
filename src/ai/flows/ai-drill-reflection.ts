
'use server';

/**
 * @fileOverview A Genkit flow that analyzes a user's practice drill reflection and
 * generates clarifying questions to encourage deeper insight.
 *
 * - getDrillClarifyingQuestions - The main function to generate questions.
 * - DrillClarifyingQuestionsInput - The input type for the function.
 * - DrillClarifyingQuestionsOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DrillClarifyingQuestionsInputSchema = z.object({
  drillName: z.string().describe("The name of the drill the user just practiced."),
  drillCategory: z.string().describe("The category of the drill (e.g., Driving, Putting)."),
  userNotes: z.string().describe("The user's initial reflection on their practice drill performance."),
  pastRoundObservations: z.array(z.string()).describe("A list of the user's reflections from previous golf rounds to identify recurring themes or recent issues."),
  pastDrillNotes: z.array(z.string()).describe("A list of the user's notes from previous practice drills to see patterns in practice."),
});
export type DrillClarifyingQuestionsInput = z.infer<typeof DrillClarifyingQuestionsInputSchema>;

const DrillClarifyingQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of 2-3 probing questions to help the user reflect more deeply on their practice.'),
});
export type DrillClarifyingQuestionsOutput = z.infer<typeof DrillClarifyingQuestionsOutputSchema>;


export async function getDrillClarifyingQuestions(input: DrillClarifyingQuestionsInput): Promise<DrillClarifyingQuestionsOutput> {
  return drillClarifyingQuestionsFlow(input);
}

const drillClarifyingQuestionsPrompt = ai.definePrompt({
  name: 'drillClarifyingQuestionsPrompt',
  input: {schema: DrillClarifyingQuestionsInputSchema},
  output: {schema: DrillClarifyingQuestionsOutputSchema},
  prompt: `You are an insightful and encouraging golf coach. A player has just completed a practice drill and provided their initial thoughts. Your primary goal is to help them reflect more deeply and connect their practice to their on-course performance. Avoid asking about external conditions like the weather or green speed.

Drill Information:
- Name: {{{drillName}}}
- Category: {{{drillCategory}}}

Player's Notes on this Drill:
"{{{userNotes}}}"

Your Task:
Analyze their notes and generate 2-3 concise, open-ended questions to help them reflect more deeply.
- **Connect Practice to Play:** Link the feeling or result from the drill to a specific on-course situation. (e.g., "You mentioned 3-putting in your last round. Did this drill give you any new feelings for distance control that might help with that?")
- **Explore Feelings & Sensations:** Ask about the physical feelings of a good vs. bad repetition. (e.g., "You scored 7/10, which is great. What did the well-struck shots *feel* like compared to the misses?")
- **Identify Root Causes:** If they mention a recurring fault, ask what they think might be causing it in their setup or swing. (e.g., "When you were pulling shots, did you notice anything in your setup or tempo?")
- **Look for Patterns:** Reference their past performance data to see if this is a recurring theme. (e.g., "I see from a past round you were struggling with your driving accuracy. How did the 'Fairway Finder' drill feel today? Did you discover anything that might help on the course?")

Data for Analysis:

Here are their observations from past rounds:
{{#if pastRoundObservations}}
{{#each pastRoundObservations}}
- {{{this}}}
{{/each}}
{{else}}
- No past round observations provided.
{{/if}}

Here are their notes from past drill sessions:
{{#if pastDrillNotes}}
{{#each pastDrillNotes}}
- {{{this}}}
{{/each}}
{{else}}
- No past drill notes provided.
{{/if}}

Now, generate your 2-3 questions based on the player's skills and performance, not external conditions.
`,
});

const drillClarifyingQuestionsFlow = ai.defineFlow(
  {
    name: 'drillClarifyingQuestionsFlow',
    inputSchema: DrillClarifyingQuestionsInputSchema,
    outputSchema: DrillClarifyingQuestionsOutputSchema,
  },
  async input => {
    const {output} = await drillClarifyingQuestionsPrompt(input);
    return {
        questions: output!.questions,
    };
  }
);
